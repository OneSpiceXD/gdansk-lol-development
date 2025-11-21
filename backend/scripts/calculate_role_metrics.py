"""
Role-Specific Metrics Calculator
Calculates all role-specific metrics from Riot API match data
"""
import json
import math
from typing import Dict, Any, Optional, List, Tuple


class RoleMetricsCalculator:
    """Calculate role-specific metrics from match data"""

    def __init__(self):
        # Lane position mappings for roaming detection
        self.lane_positions = {
            'TOP': {'x_range': (0, 4000), 'y_range': (0, 6000)},
            'JUNGLE': None,  # Jungle is determined by being in jungle zones
            'MID': {'x_range': (4000, 10000), 'y_range': (4000, 10000)},
            'ADC': {'x_range': (10000, 15000), 'y_range': (9000, 15000)},
            'SUPPORT': {'x_range': (10000, 15000), 'y_range': (9000, 15000)},
        }

    def calculate_all_metrics(self, match_data: Dict, timeline_data: Optional[Dict], participant_id: int, role: str) -> Dict[str, float]:
        """
        Calculate all metrics for a player from match data

        Args:
            match_data: Full match data from Riot API
            timeline_data: Timeline data (optional, for advanced metrics)
            participant_id: Player's participant ID (1-10)
            role: Player's role (TOP, JUNGLE, MID, ADC, SUPPORT)

        Returns:
            Dictionary of calculated metrics
        """
        participant = self._get_participant_data(match_data, participant_id)
        if not participant:
            return {}

        game_duration = match_data['info']['gameDuration']  # seconds

        metrics = {}

        # Calculate based on role
        if role == 'ADC':
            metrics = self._calculate_adc_metrics(participant, game_duration)
        elif role == 'SUPPORT':
            metrics = self._calculate_support_metrics(participant, game_duration, timeline_data, participant_id)
        elif role == 'JUNGLE':
            metrics = self._calculate_jungle_metrics(participant, game_duration, timeline_data, participant_id)
        elif role == 'MID':
            metrics = self._calculate_mid_metrics(participant, game_duration, timeline_data, participant_id)
        elif role == 'TOP':
            metrics = self._calculate_top_metrics(participant, game_duration)

        return metrics

    def _get_participant_data(self, match_data: Dict, participant_id: int) -> Optional[Dict]:
        """Extract participant data from match data"""
        participants = match_data.get('info', {}).get('participants', [])
        for p in participants:
            if p.get('participantId') == participant_id:
                return p
        return None

    def _calculate_adc_metrics(self, p: Dict, game_duration: int) -> Dict:
        """Calculate ADC-specific metrics"""
        game_minutes = game_duration / 60.0

        return {
            # Direct metrics
            'damage_per_minute': self._get_challenge(p, 'damagePerMinute', 0.0),
            'damage_share': self._get_challenge(p, 'teamDamagePercentage', 0.0),

            # Calculated metrics
            'cs_per_minute': (p.get('totalMinionsKilled', 0) + p.get('neutralMinionsKilled', 0)) / game_minutes,
            'gold_efficiency': p.get('totalDamageDealtToChampions', 0) / max(p.get('goldEarned', 1), 1),
            'positioning_score': p.get('totalDamageDealtToChampions', 0) / max(p.get('deaths', 1), 1),
            'objective_damage': p.get('damageDealtToTurrets', 0) + p.get('damageDealtToObjectives', 0),
        }

    def _calculate_support_metrics(self, p: Dict, game_duration: int, timeline: Optional[Dict], participant_id: int) -> Dict:
        """Calculate Support-specific metrics"""
        game_minutes = game_duration / 60.0

        # Roaming impact requires timeline analysis
        roaming_impact = 0
        if timeline:
            roaming_impact = self._calculate_roaming_impact(timeline, participant_id, 'SUPPORT')

        return {
            # Direct metrics
            'vision_score_per_minute': self._get_challenge(p, 'visionScorePerMinute', 0.0),
            'kill_participation': self._get_challenge(p, 'killParticipation', 0.0),
            'crowd_control_score': p.get('timeCCingOthers', 0),

            # Calculated metrics
            'gold_efficiency': (p.get('assists', 0) + p.get('wardsPlaced', 0) / 2.0) / (p.get('goldEarned', 1) / 1000.0),
            'death_efficiency': (p.get('assists', 0) + self._get_challenge(p, 'saveAllyFromDeath', 0)) / max(p.get('deaths', 1), 1),

            # Timeline metrics
            'roaming_impact': roaming_impact,
        }

    def _calculate_jungle_metrics(self, p: Dict, game_duration: int, timeline: Optional[Dict], participant_id: int) -> Dict:
        """Calculate Jungle-specific metrics"""
        game_minutes = game_duration / 60.0

        # Jungle proximity requires timeline analysis
        jungle_proximity_data = None
        if timeline:
            jungle_proximity_data = self._calculate_jungle_proximity(timeline, participant_id)

        return {
            # Direct metrics
            'kill_participation': self._get_challenge(p, 'killParticipation', 0.0),
            'early_game_impact': self._get_challenge(p, 'takedownsFirstXMinutes', 0),
            'vision_score': p.get('visionScore', 0),

            # Calculated metrics
            'cs_per_minute': (p.get('totalMinionsKilled', 0) + p.get('neutralMinionsKilled', 0)) / game_minutes,
            'objective_control': p.get('dragonKills', 0) + p.get('baronKills', 0) + self._get_challenge(p, 'riftHeraldTakedowns', 0),

            # Timeline metrics (stored as JSON)
            'jungle_proximity': jungle_proximity_data,
        }

    def _calculate_mid_metrics(self, p: Dict, game_duration: int, timeline: Optional[Dict], participant_id: int) -> Dict:
        """Calculate Mid lane-specific metrics"""
        game_minutes = game_duration / 60.0

        # Roaming impact requires timeline analysis
        roaming_impact = 0
        if timeline:
            roaming_impact = self._calculate_roaming_impact(timeline, participant_id, 'MID')

        return {
            # Direct metrics
            'damage_per_minute': self._get_challenge(p, 'damagePerMinute', 0.0),
            'kill_participation': self._get_challenge(p, 'killParticipation', 0.0),
            'solo_kills': self._get_challenge(p, 'soloKills', 0),
            'vision_score': p.get('visionScore', 0),

            # Calculated metrics
            'cs_per_minute': (p.get('totalMinionsKilled', 0) + p.get('neutralMinionsKilled', 0)) / game_minutes,

            # Timeline metrics
            'roaming_impact': roaming_impact,
        }

    def _calculate_top_metrics(self, p: Dict, game_duration: int) -> Dict:
        """Calculate Top lane-specific metrics"""
        game_minutes = game_duration / 60.0

        # Early game dominance
        solo_kills = self._get_challenge(p, 'soloKills', 0)
        early_takedowns = self._get_challenge(p, 'takedownsFirstXMinutes', 0)
        deaths = max(p.get('deaths', 1), 1)
        early_game_dominance = (solo_kills + early_takedowns) / deaths

        # Durability score
        damage_taken = p.get('totalDamageTaken', 0)
        damage_mitigated = p.get('damageSelfMitigated', 0)
        durability_score = (damage_taken + damage_mitigated) / deaths

        # Split push pressure
        turret_damage = p.get('damageDealtToTurrets', 0)
        solo_turrets = self._get_challenge(p, 'soloTurretsLategame', 0)
        turret_plates = self._get_challenge(p, 'turretPlatesTaken', 0)
        split_push_pressure = (turret_damage / 1000.0) + (solo_turrets * 2) + turret_plates

        return {
            # Direct metrics
            'damage_per_minute': self._get_challenge(p, 'damagePerMinute', 0.0),
            'solo_kills': solo_kills,

            # Calculated metrics
            'cs_per_minute': (p.get('totalMinionsKilled', 0) + p.get('neutralMinionsKilled', 0)) / game_minutes,
            'early_game_dominance': early_game_dominance,
            'durability_score': int(durability_score),
            'split_push_pressure': split_push_pressure,
        }

    def _get_challenge(self, participant: Dict, challenge_key: str, default=0) -> Any:
        """Safely get challenge value from participant data"""
        challenges = participant.get('challenges', {})
        return challenges.get(challenge_key, default)

    def _calculate_roaming_impact(self, timeline: Dict, participant_id: int, role: str) -> int:
        """
        Calculate roaming impact from timeline data
        Count kills/assists that occur outside the player's primary lane
        """
        if not timeline or 'info' not in timeline:
            return 0

        frames = timeline['info'].get('frames', [])
        roam_count = 0

        # Get lane position bounds
        lane_bounds = self.lane_positions.get(role)
        if not lane_bounds:
            return 0

        for frame in frames:
            events = frame.get('events', [])

            for event in events:
                if event.get('type') != 'CHAMPION_KILL':
                    continue

                # Check if our player participated
                killer_id = event.get('killerId')
                assisting_ids = event.get('assistingParticipantIds', [])

                if participant_id not in [killer_id] + assisting_ids:
                    continue

                # Check if kill occurred outside primary lane
                position = event.get('position', {})
                x = position.get('x', 0)
                y = position.get('y', 0)

                # If kill is outside lane bounds, count as successful roam
                if not self._is_in_lane_bounds(x, y, lane_bounds):
                    roam_count += 1

        return roam_count

    def _is_in_lane_bounds(self, x: int, y: int, lane_bounds: Dict) -> bool:
        """Check if position is within lane bounds"""
        x_range = lane_bounds.get('x_range', (0, 0))
        y_range = lane_bounds.get('y_range', (0, 0))

        return (x_range[0] <= x <= x_range[1]) and (y_range[0] <= y <= y_range[1])

    def _calculate_jungle_proximity(self, timeline: Dict, participant_id: int) -> Optional[Dict]:
        """
        Calculate jungle proximity from timeline position data
        Returns percentage of time spent in different map zones
        """
        if not timeline or 'info' not in timeline:
            return None

        frames = timeline['info'].get('frames', [])

        zone_counts = {
            'friendly_jungle': 0,
            'enemy_jungle': 0,
            'lanes': 0,
            'river': 0
        }
        total_frames = 0

        for frame in frames:
            participant_frames = frame.get('participantFrames', {})
            participant_frame = participant_frames.get(str(participant_id))

            if not participant_frame:
                continue

            position = participant_frame.get('position', {})
            x = position.get('x', 0)
            y = position.get('y', 0)

            if x == 0 and y == 0:
                continue  # Invalid position

            # Determine zone (simplified map zones for Summoner's Rift)
            zone = self._get_map_zone(x, y, participant_id)
            if zone:
                zone_counts[zone] += 1
                total_frames += 1

        if total_frames == 0:
            return None

        # Calculate percentages
        return {
            'friendly_jungle': round(zone_counts['friendly_jungle'] / total_frames, 3),
            'enemy_jungle': round(zone_counts['enemy_jungle'] / total_frames, 3),
            'lanes': round(zone_counts['lanes'] / total_frames, 3),
            'river': round(zone_counts['river'] / total_frames, 3),
        }

    def _get_map_zone(self, x: int, y: int, participant_id: int) -> Optional[str]:
        """
        Determine map zone from position coordinates
        Simplified Summoner's Rift map zones
        """
        # Blue side is participants 1-5, Red side is 6-10
        is_blue_side = participant_id <= 5

        # River zone (approximate diagonal from top-left to bottom-right)
        # River runs roughly along the line y = x
        distance_to_river = abs(y - x)
        if distance_to_river < 2000:
            return 'river'

        # Jungle zones (simplified - between lanes and river)
        # Blue jungle is bottom-left quadrant
        # Red jungle is top-right quadrant

        if is_blue_side:
            # Blue side player
            if x < 6000 and y > 8000:  # Blue jungle
                return 'friendly_jungle'
            elif x > 8000 and y < 6000:  # Red jungle
                return 'enemy_jungle'
            else:
                return 'lanes'
        else:
            # Red side player
            if x > 8000 and y < 6000:  # Red jungle
                return 'friendly_jungle'
            elif x < 6000 and y > 8000:  # Blue jungle
                return 'enemy_jungle'
            else:
                return 'lanes'


# Utility functions for extracting data from match
def extract_match_stats_for_db(match_data: Dict, timeline_data: Optional[Dict], participant_id: int, role: str) -> Dict:
    """
    Extract all necessary stats from match data for database storage

    Returns a dictionary ready for insertion into match_stats table
    """
    participant = None
    for p in match_data['info']['participants']:
        if p['participantId'] == participant_id:
            participant = p
            break

    if not participant:
        return {}

    game_duration = match_data['info']['gameDuration']
    game_minutes = game_duration / 60.0

    # Calculate role-specific metrics
    calculator = RoleMetricsCalculator()
    role_metrics = calculator.calculate_all_metrics(match_data, timeline_data, participant_id, role)

    # Extract basic stats
    stats = {
        'match_id': match_data['metadata']['matchId'],
        'role': role,
        'champion_id': participant['championId'],
        'game_duration': game_duration,
        'win': participant['win'],

        # Core stats
        'kills': participant['kills'],
        'deaths': participant['deaths'],
        'assists': participant['assists'],

        # Farm stats
        'total_minions_killed': participant['totalMinionsKilled'],
        'neutral_minions_killed': participant['neutralMinionsKilled'],
        'cs_per_minute': role_metrics.get('cs_per_minute', 0),

        # Damage stats
        'total_damage_to_champions': participant['totalDamageDealtToChampions'],
        'damage_per_minute': role_metrics.get('damage_per_minute', 0),
        'damage_share': role_metrics.get('damage_share', 0),
        'total_damage_taken': participant['totalDamageTaken'],
        'damage_self_mitigated': participant['damageSelfMitigated'],

        # Gold stats
        'gold_earned': participant['goldEarned'],

        # Vision stats
        'vision_score': participant['visionScore'],
        'vision_score_per_minute': role_metrics.get('vision_score_per_minute', 0),
        'wards_placed': participant['wardsPlaced'],
        'wards_killed': participant['wardsKilled'],
        'control_wards_purchased': participant.get('visionWardsBoughtInGame', 0),

        # Objective stats
        'damage_to_turrets': participant['damageDealtToTurrets'],
        'damage_to_objectives': participant['damageDealtToObjectives'],
        'turret_plates_taken': participant.get('challenges', {}).get('turretPlatesTaken', 0),
        'turrets_killed': participant.get('turretKills', 0),
        'dragon_kills': participant.get('dragonKills', 0),
        'baron_kills': participant.get('baronKills', 0),
        'rift_herald_kills': participant.get('challenges', {}).get('riftHeraldTakedowns', 0),

        # Combat stats
        'time_ccing_others': participant.get('timeCCingOthers', 0),
        'total_heal_on_teammates': participant.get('totalHealsOnTeammates', 0),
        'total_damage_shielded_on_teammates': participant.get('totalDamageShieldedOnTeammates', 0),

        # Challenge stats
        'kill_participation': role_metrics.get('kill_participation', 0),
        'solo_kills': participant.get('challenges', {}).get('soloKills', 0),
        'takedowns_first_15_min': participant.get('challenges', {}).get('takedownsFirstXMinutes', 0),
        'save_ally_from_death': participant.get('challenges', {}).get('saveAllyFromDeath', 0),

        # Role-specific metrics
        'gold_efficiency': role_metrics.get('gold_efficiency'),
        'positioning_score': role_metrics.get('positioning_score'),
        'death_efficiency': role_metrics.get('death_efficiency'),
        'objective_control_score': role_metrics.get('objective_control'),
        'early_game_dominance': role_metrics.get('early_game_dominance'),
        'durability_score': role_metrics.get('durability_score'),
        'split_push_pressure': role_metrics.get('split_push_pressure'),
        'roaming_impact': role_metrics.get('roaming_impact'),
        'jungle_proximity': json.dumps(role_metrics.get('jungle_proximity')) if role_metrics.get('jungle_proximity') else None,
    }

    return stats


if __name__ == "__main__":
    # Example usage
    print("Role Metrics Calculator")
    print("This module calculates role-specific metrics from Riot API match data")

    # Example: Load sample data and calculate metrics
    try:
        with open('match_details_sample.json', 'r') as f:
            match_data = json.load(f)

        with open('match_timeline_sample.json', 'r') as f:
            timeline_data = json.load(f)

        calculator = RoleMetricsCalculator()

        # Calculate for first participant (assumed ADC)
        metrics = calculator.calculate_all_metrics(match_data, timeline_data, 1, 'ADC')

        print("\nCalculated ADC Metrics:")
        for key, value in metrics.items():
            print(f"  {key}: {value}")

    except FileNotFoundError:
        print("\nSample data files not found. This is normal if running from different directory.")

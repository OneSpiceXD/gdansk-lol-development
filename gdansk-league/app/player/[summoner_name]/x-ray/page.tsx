'use client'

import { useParams } from 'next/navigation'
import XRayTab from '../components/XRayTab'

export default function XRayPage() {
  const params = useParams()
  const summonerName = params.summoner_name as string

  return <XRayTab summonerName={summonerName} />
}

import Hero from '@/components/v2/Hero';
import PolandMap from '@/components/v2/PolandMap';
import ActivityFeed from '@/components/v2/ActivityFeed';
import Features from '@/components/v2/Features';
import EmailCapture from '@/components/v2/EmailCapture';

export default function V2Home() {
  return (
    <>
      <Hero />
      <PolandMap />
      <ActivityFeed />
      <Features />
      <EmailCapture />
    </>
  );
}

import { Metadata } from 'next';
import { PodcastPage } from './_components/podcast-page';

export const metadata: Metadata = {
  title: 'Podcast - Haber Podcastleri',
  description: 'Güncel haberlerin sesli versiyonlarını dinleyin',
};

export default function Podcast() {
  return <PodcastPage />;
}

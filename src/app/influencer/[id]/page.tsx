import InfluencerMetrics from "@/components/InfluencerProfile/InfluencerMetrics";
import InfluencerTable from "@/components/InfluencerProfile/InfluencerTable";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function page({ params }: PageProps) {
  const { id } = await params;
  return (
    <div>
      <InfluencerMetrics />
      <InfluencerTable influencerId={id} />
    </div>
  );
}

export default page;

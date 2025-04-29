import SignalStats from "@/components/InfluencerProfile/SignalStats";
// import InfluencerTable from "@/components/InfluencerProfile/InfluencerTable";
import InfluencerMetrics from "@/components/InfluencerProfile/InfluencerMetrics";
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function page({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="py-4 px-5">
      <InfluencerMetrics influencerId={id} />
      <SignalStats influencerId={id} />
    </div>
  );
}

export default page;

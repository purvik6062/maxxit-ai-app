import dbConnect from "src/utils/dbConnect";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the params Promise
  const client = await dbConnect();
  const db = client.db('test_analysis');
  const collection = db.collection('shares');
  const share = await collection.findOne({ id: resolvedParams.id });

  if (!share) {
    return {
      title: 'Not Found',
      description: 'Share not found',
    };
  }

  console.log("img", share.image);

  return {
    title: 'Shared Content',
    description: share.content,
    openGraph: {
      title: 'Shared Content - Other platforms',
      description: share.content,
      url: `http://localhost:3000/share/${resolvedParams.id}`, // Use resolvedParams.id
      images: [
        {
          url: share.image,
          width: 400,
          height: 300,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shared Content - Twitter',
      description: share.content,
      images: [share.image],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the params Promise
  const client = await dbConnect();
  const db = client.db('test_analysis');
  const collection = db.collection('shares');
  const share = await collection.findOne({ id: resolvedParams.id });

  if (!share) {
    return <div className="text-center text-red-500">Share not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shared Content</h1>
      <p className="mb-4">{share.content}</p>
      <a href={share.link} className="text-blue-500 underline mb-4 block">
        Visit Link
      </a>
      <img src={share.image} alt="Shared content" className="max-w-full h-auto" />
    </div>
  );
}
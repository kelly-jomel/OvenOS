import CakeBuilder from '@/components/CakeBuilder';

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Create Your Masterpiece
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our interactive cake builder lets you customize every detail. See the estimated quote instantly before placing your order.
          </p>
        </div>
        
        <CakeBuilder />
      </div>
    </div>
  );
}

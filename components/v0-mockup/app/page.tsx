import IPadMockup from "../ipad-mockup"
import PhoneMockup from "../phone-mockup"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Device Mockup Components</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">iPad Mockup</h2>
            <IPadMockup />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Phone Mockup</h2>
            <PhoneMockup />
          </div>
        </div>
      </div>
    </main>
  )
}


import IPadWithApp from "./ipad-with-app"
import SmartphoneMockup from "./smartphone-mockup"

export default function DeviceMockups() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Responsive Design Showcase</h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="w-full md:w-auto">
            <SmartphoneMockup />
          </div>
          <div className="w-full md:w-auto">
            <IPadWithApp />
          </div>
        </div>
      </div>
    </div>
  )
}


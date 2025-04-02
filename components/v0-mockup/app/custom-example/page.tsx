import IPadMockup from "../../ipad-mockup"
import PhoneMockup from "../../phone-mockup"

export default function CustomExample() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Custom Content Examples</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">iPad with Custom Content</h2>
            <IPadMockup>
              <CustomIPadContent />
            </IPadMockup>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Phone with Custom Content</h2>
            <PhoneMockup>
              <CustomPhoneContent />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </main>
  )
}

function CustomIPadContent() {
  return (
    <div className="min-h-full bg-white">
      {/* Navigation */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="text-xl font-bold text-blue-600">Analytics Dashboard</div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">Upgrade Plan</div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
            JD
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Users", value: "24,521", change: "+12%", color: "blue" },
            { label: "Revenue", value: "$86,304", change: "+8%", color: "green" },
            { label: "Active Sessions", value: "1,203", change: "+18%", color: "purple" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-gray-500 text-sm mb-2">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className={`text-sm text-${stat.color}-600`}>{stat.change} from last month</div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
            <div className="flex gap-2">
              {["Day", "Week", "Month", "Year"].map((period) => (
                <div
                  key={period}
                  className={`px-3 py-1 rounded-md text-sm ${
                    period === "Month" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="w-full px-8">
              <div className="flex items-end justify-between h-40">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full">
                    <div
                      className="bg-blue-500 rounded-t-sm mx-1"
                      style={{
                        height: `${Math.floor(Math.random() * 70) + 20}%`,
                        opacity: 0.6 + i / 30,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                  <div key={month}>{month}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-${
                    ["blue", "green", "purple", "pink", "orange"][i % 5]
                  }-500`}
                >
                  {["U", "P", "S", "C", "A"][i % 5]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {
                      [
                        "New user registered",
                        "Payment processed",
                        "System update completed",
                        "Campaign launched",
                        "API integration added",
                      ][i % 5]
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {["2 minutes ago", "1 hour ago", "3 hours ago", "Yesterday", "2 days ago"][i % 5]}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {["User #24601", "$129.99", "v2.4.0", "Summer Sale", "Stripe API"][i % 5]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomPhoneContent() {
  return (
    <div className="min-h-full bg-white pt-8">
      {/* App Header */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Weather</h1>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                fill="currentColor"
              />
              <path
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                fill="currentColor"
              />
              <path
                d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <div className="text-sm text-gray-600">San Francisco, CA</div>
      </div>

      {/* Current Weather */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl mx-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-5xl font-light mb-1">72°</div>
            <div className="text-lg">Sunny</div>
            <div className="text-sm text-blue-100 mt-1">Feels like 75°</div>
          </div>
          <div className="text-6xl">☀️</div>
        </div>
        <div className="flex justify-between items-center mt-6 text-blue-100 text-sm">
          <div>Wind: 5 mph</div>
          <div>Humidity: 45%</div>
          <div>UV: 6</div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Today</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const hour = (new Date().getHours() + i + 1) % 24
            const temp = 70 + Math.floor(Math.sin(i / 3) * 8)
            const icons = ["☀️", "⛅", "☀️", "⛅", "☁️", "⛅", "☀️", "☀️", "⛅", "☀️", "🌙", "🌙"]

            return (
              <div key={i} className="flex flex-col items-center bg-gray-50 rounded-lg p-3 min-w-[60px]">
                <div className="text-xs text-gray-500">
                  {hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`}
                </div>
                <div className="text-xl my-1">{icons[i]}</div>
                <div className="text-sm font-medium">{temp}°</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">7-Day Forecast</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() + i)
            const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
            const high = 65 + Math.floor(Math.sin(i / 2) * 10 + 10)
            const low = high - 10 - Math.floor(Math.random() * 5)
            const icons = ["☀️", "⛅", "☀️", "🌧️", "⛈️", "⛅", "☀️"]

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-4 ${i < 6 ? "border-b border-gray-100" : ""}`}
              >
                <div className="w-16 text-sm font-medium">{i === 0 ? "Today" : day}</div>
                <div className="text-xl">{icons[i]}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{high}°</span>
                  <span className="text-sm text-gray-500">{low}°</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Info */}
      <div className="px-4 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Sunrise", value: "6:42 AM", icon: "🌅" },
            { label: "Sunset", value: "7:58 PM", icon: "🌇" },
            { label: "Precipitation", value: "0%", icon: "💧" },
            { label: "Humidity", value: "45%", icon: "💦" },
            { label: "Wind", value: "5 mph NW", icon: "💨" },
            { label: "Pressure", value: "1012 hPa", icon: "🔄" },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{item.icon}</span>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="text-base font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Selector */}
      <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-900">Change Location</div>
          <div className="text-sm text-blue-600">View on Map</div>
        </div>
      </div>
    </div>
  )
}


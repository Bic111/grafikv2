import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Witaj w systemie Grafik
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            Profesjonalne zarządzanie grafikami pracy pracowników
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/settings/employees"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-xl font-semibold mb-2">Pracownicy</h2>
              <p className="text-gray-600">
                Zarządzaj listą pracowników, rolami i wymiarami etatów
              </p>
            </Link>

            <Link
              href="/settings/shifts"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">⏰</div>
              <h2 className="text-xl font-semibold mb-2">Zmiany</h2>
              <p className="text-gray-600">
                Konfiguruj zmiany robocze dla każdego dnia tygodnia
              </p>
            </Link>

            <Link
              href="/schedule"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-xl font-semibold mb-2">Grafik</h2>
              <p className="text-gray-600">
                Przeglądaj i edytuj grafiki pracy (wkrótce)
              </p>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Jak zacząć?</h2>
            <ol className="text-left space-y-3 max-w-2xl mx-auto">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>
                  <strong>Dodaj pracowników:</strong> Przejdź do sekcji "Pracownicy" i dodaj
                  członków swojego zespołu
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>
                  <strong>Skonfiguruj zmiany:</strong> W sekcji "Zmiany" zdefiniuj godziny pracy
                  dla każdego dnia
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  3
                </span>
                <span>
                  <strong>Twórz grafiki:</strong> Korzystaj z automatycznego generowania lub
                  twórz grafiki ręcznie
                </span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}

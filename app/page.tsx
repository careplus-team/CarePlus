export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <section className="w-full max-w-xl bg-white rounded-lg shadow-md p-8 mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to CarePlus</h1>
        <p className="text-gray-700 mb-6">
          Discover the main features of our system. Register or log in to get
          started!
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
          >
            Register
          </a>
          <a
            href="/login"
            className="bg-gray-100 text-blue-600 px-6 py-2 rounded border border-blue-600 hover:bg-blue-50 transition font-medium"
          >
            Login
          </a>
        </div>
      </section>
    </main>
  );
}

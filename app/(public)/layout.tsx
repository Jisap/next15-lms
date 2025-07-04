

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h1>Navbar</h1>
      <main className="container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
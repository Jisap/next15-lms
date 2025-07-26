import { CourseSidebar } from "../_components/CourseSidebar"




const Courselayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-1">
      {/* sidebar - 30% */}
      <div className="w-80 border-r border-border shrink-0">
        <CourseSidebar />
      </div>

      {/* main - 70% */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default Courselayout
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DndContext, DragEndEvent, DraggableSyntheticListeners, KeyboardSensor, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ReactNode, useState } from "react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, GripVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"




interface iAppProps {
  data: AdminCourseSingularType
}

interface SortableItemProps {
  id: string;
  children: ( // El children debe ser una función y recibe una prop de listeners -> manejan eventos que detectan cuando el usuario empieza a arrastrar un elemento
    listeners: DraggableSyntheticListeners) => ReactNode; // La función devuelve un nodo de React
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string; // This is only relevant to lessons.
  };
}


export const CourseStructure = ({ data }: iAppProps) => {

  const initialItems = data.chapter.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    order: chapter.position,
    isOpen: true, // default chapter to open
    lessons: chapter.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.position,
    }))
  })) || [];

  const [items, setItems] = useState(
    initialItems
  )


  function SortableItem({ children, id, className, data }: SortableItemProps) {
    const {
      attributes,
      listeners, // detectan el drag
      setNodeRef,
      transform, // Calcula la nueva posición -> cuando se hace el drop DndContext dispara el evento onDragEnd en la función handleDragEnd
      transition,
      isDragging,// Indica si el elemento está siendo arrastrado
    } = useSortable({ id: id, data: data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        className={cn(
          "touch-none", 
          className,
          isDragging ? "z-10" : ""
        )}  
      >
        {children(listeners) }
      </div>
    );
  }

  //Calcula los índesc viejo y nuevo y utiliza arrayMove para crear un array reordenado
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return; // Add null check

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter
      )
    );
  }


  const sensors = useSensors( // Detecta las acciones de entrada del usuario (click, toque de pantalla o teclado) que inician el drag
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext 
      collisionDetection={rectIntersection} 
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
        </CardHeader>

        <CardContent>
          <SortableContext 
            items={items}
            strategy={verticalListSortingStrategy}
          >
           {items.map((item) => (
              <SortableItem 
                key={item.id} 
                id={item.id}
                data={{type: "chapter"}}
              >
                {(listeners) => (
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)} // Click en el CollapsibleTrigger cambia el state de isOpen
                    >
                      <div className="flex items-center justify-between p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <button className="cursor-grab opacity-60 hover:opacity-100" {...listeners}>
                            <GripVerticalIcon className="size-4" />
                          </button>
                            
                          <CollapsibleTrigger asChild>
                            <button
                              className="flex items-center"
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ):(
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          </CollapsibleTrigger>

                          <p className="cursor-pointer hover:text-primary">{item.title}</p>
                        </div>
                      </div>
                    </Collapsible>
                  </Card>
                )}
             </SortableItem>
           ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  )
}


"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  DndContext, 
  DragEndEvent, 
  DraggableSyntheticListeners, 
  KeyboardSensor, 
  PointerSensor, 
  rectIntersection, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core"
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course"
import { cn } from "@/lib/utils"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  GripVerticalIcon, 
  Trash2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { reorderChapters, reorderLessons } from "../action"




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


  function SortableItem({ children, id, className, data }: SortableItemProps) { // Función que renderiza elementos arrastrables de una lista
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
        {children(listeners)}
      </div>
    );
  }

  //controlador de eventos que se dispara justo cuando sueltas un elemento después de haberlo arrastrado.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;                                                     // Cuando se empieza el drag el evento contiene 2 props: active que es el elemento que se arrastra y over que es el elemento sobre el que se está arrastrando

    if (!over || active.id === over.id) return;                                         // Si no hay elemento sobre el que se está arrastrando o el elemento arrastrado es el mismo que el elemento sobre el que se está arrastrando, no hace nada porque no hay nada que reordenar

    const activeId = active.id;                                                         // Id del elemento arrastrado
    const overId = over.id;                                                             // Id del elemento sobre el que se está arrastrando
    const activeType = active.data.current?.type as "chapter" | "lesson";               // Tipo del elemento arrastrado
    const overType = over.data.current?.type as "chapter" | "lesson";                   // Tipo del elemento sobre el que se está arrastrando. Todo esto nos permite saber si estamos moviendo un capítulo o una lección
    const courseId = data.id;

    // Lógica para mover capítulos. El objetivo es saber en qué posición 
    // del array de capítulos debe insertarse el capítulo arrastrado.
    if(activeType === "chapter"){                                                        // Si movimos un capítulo
      let targetChapterId = null;
      
      if(overType === "chapter"){                                                        // y los soltamos sobre otro capítulo
        targetChapterId = overId;                                                        // entonces el destino ese mismo capítulo     
      }else if(overType === "lesson"){                                                   // pero si lo soltamos sobre una lección
        targetChapterId = over.data.current?.chapterId ?? null                           // entonces el destino es el capítulo que contiene la lección
      }

      if(!targetChapterId){// Validación
        toast.error("Could not determine the chapter for reordering");
        return;
      }

      //Calculamos índices
      const oldIndex = items.findIndex((item) => item.id === activeId);                   // Índice del capítulo arrastrado en el array de items original
      const newIndex = items.findIndex((item) => item.id === targetChapterId);            // Índice del capítulo destino

      if(oldIndex === -1 || newIndex === -1){ // Validación
        toast.error("Could not find chapter old/new index for reordering");
        return;
      }

      // Reordenar el array de capítulos
      const reordedLocalChapter = arrayMove(items, oldIndex, newIndex);                    // arrayMove crea un nuevo array con el elemento oldIndex movido a newIndex
      const updatedChapterForState = reordedLocalChapter.map((chapter, index) => ({        // Se recorre el nuevo array reordenado y asigna el order correcto a cada capítulo según su nueva posición (índice + 1). 
        ...chapter,
        order: index + 1, // para que no aparezca index 0
      }))

      const previousItems = [...items]; // Para usar en futura mutation

      setItems(updatedChapterForState);                                                    // Actualiza el state de items
     
      // Se procede a aplicar los cambios en la base de datos
      if (courseId) {
        const chaptersToUpdate = updatedChapterForState.map((chapter) => ({                // Se recorre el array de lessons reordenado y establecemos para cada lección el nuevo order
          id: chapter.id,
          position: chapter.order,
        }));

        const reorderChapterPromise = () => reorderChapters( courseId, chaptersToUpdate );  // Usamos la action actualizar el reordenamiento en bd

        toast.promise(reorderChapterPromise, {
          loading: "Reordering chapters...",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems); // Se restaura el state de items a su valor original
            return "Failed to reorder chapters. Please try again later.";
          }
        });
      }
    }

    // Lógica para mover lecciones.
    if (activeType === "lesson" && overType === "lesson") {                                       // solo se ejecute el código si estamos moviendo una lección y la soltamos sobre otra lección.
      const chapterId = active.data.current?.chapterId;                                           // ids del elemento arrastrado
      const overChapterId = over.data.current?.chapterId;                                         // ids del elemento sobre el que se está arrastrando

      if(!chapterId || chapterId !== overChapterId){                                              // Solo se deja mover lecciones en el mismo capítulo
        toast.error("Lesson move between different chapters or invalid chapter id not allowed.");
        return;
      }

      const chapterIndex = items.findIndex((chapter) => chapter.id === chapterId);                 // Índice del capítulo donde se encuentra el elemento arrastrado
      
      if(chapterIndex === -1){ // Validación
        toast.error("Could not find chapter for lesson");
        return;
      }

      const chapterToUpdate = items[chapterIndex];                                                  // Capítulo donde se encuentra el elemento arrastrado
    
      const oldLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === activeId); // Índice del lección arrastrado en el array de lessons del capítulo
    
      const newLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === overId);   // Índice del lección destino

      if(oldLessonIndex === -1 || newLessonIndex === -1){ // Validación
        toast.error("Could not find lesson for reordering");
        return;
      }

      const reordedLessons = arrayMove(                                                              // arrayMove crea un nuevo array con el elemento oldIndex movido a newIndex
        chapterToUpdate.lessons, 
        oldLessonIndex, 
        newLessonIndex
      ); 

      const updatedlessonForState = reordedLessons.map((lesson, index) => ({                         // Se recorre el nuevo array reordenado y asigna el order correcto a cada lección según su nueva posición (índice + 1). 
        ...lesson,
        order: index + 1, // para que no aparezca index 0
      }))

      const newItems = [...items];                                                                   // Copia del array items

      newItems[chapterIndex] = {                                                                     // En el capítulo arrastrado se actualiza el array de lessons
        ...chapterToUpdate,                                                                  
        lessons: updatedlessonForState
      }

      const previousItems = [...items]; 
      
      setItems(newItems);                                                                          // Actualiza el state de items
    
      // Se procede a aplicar los cambios en la base de datos
      if(courseId){
        const lessonsToUpdate = updatedlessonForState.map((lesson) => ({                           // Se recorre el array de lessons reordenado y establecemos para cada lección el nuevo order
          id: lesson.id,
          position: lesson.order,
        }));

        const reorderLessonPromise = () =>  reorderLessons(chapterId, lessonsToUpdate, courseId);  // Usamos la action actualizar el reordenamiento en bd

        toast.promise(reorderLessonPromise, {
          loading: "Reordering lessons...",
          success: (result) => {
            if(result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems); // Se restaura el state de items a su valor original
            return "Failed to reorder lessons. Please try again later.";
          }
        });
      }

      return;
    }

  }

  function toggleChapter(chapterId: string) { // Cambia el state de isOpen de un chapter
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

        <CardContent className="space-y-8">
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => ( // Renderiza cada chapter
              <SortableItem
                key={item.id}
                id={item.id}
                data={{ type: "chapter" }}
              >
                {(listeners) => ( // Cada chapter tiene un Collapsible que mostrará las lecciones que contiene
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)} // Click en el CollapsibleTrigger cambia el state de isOpen
                    >
                      <div className="flex items-center justify-between p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            {...listeners}>
                            <GripVerticalIcon className="size-4" />
                          </Button>

                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex items-center"
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <p className="cursor-pointer hover:text-primary pl-2">{item.title}</p>
                        </div>

                        <Button
                          size="icon"
                          variant="outline"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            items={item.lessons.map((lesson) => lesson.id)} // Renderiza cada lección dentro del Collapsible
                            strategy={verticalListSortingStrategy}
                          >
                            {item.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                id={lesson.id}
                                data={{ type: "lesson", chapterId: item.id }}
                              >
                                {(lessonListeners) => (
                                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        {...lessonListeners}
                                      >
                                        <GripVerticalIcon className="size-4" />
                                      </Button>

                                      <FileText className="size-4"/>

                                      {/* /admin/courses/[courseId]/[chapterId]/[lessonId] */}
                                      <Link href={`/admin/courses/${data.id}/${item.id}/${lesson.id}`}> 
                                        { lesson.title }
                                      </Link>
                                    </div>

                                    <Button
                                      variant="outline"
                                      size="icon"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>

                          <div className="p-2">
                            <Button
                              variant="outline"
                              className="w-full"
                            >
                              Create new lesson
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
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


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DndContext, KeyboardSensor, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useState } from "react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export const CourseStructure = () => {

  const [items, setItems] = useState([
    "1","2","3","4"
  ])


  function SortableItem(props) {
    const {
      attributes,
      listeners, // detectan el drag
      setNodeRef,
      transform, // Calcula la nueva posición -> cuando se hace el drop DndContext dispara el evento onDragEnd en la función handleDragEnd
      transition,
    } = useSortable({ id: props.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        { props.id }
      </div>
    );
  }

  function handleDragEnd(event) { //Calcula los índesc viejo y nuevo y utiliza arrayMove para crear un array reordenado
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
            {items.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  )
}


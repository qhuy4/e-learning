import {useState} from "react";

export function useDeleteDialog<T>() {
    const [open, setOpen] = useState(false)
    const [item, setItem] = useState<T | null>(null)

    const handleDelete = (item: T) => {
        setItem(item)
        setOpen(true)
    }

    return {
        open,
        item,
        setOpen,
        handleDelete,
    }
}
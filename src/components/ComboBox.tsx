import { useState } from "react";
import krajs from "../assets/krajs.json";
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

function ComboBox({ kraj, setKraj }: { kraj: string, setKraj: Function }) {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between text-2xl font-semibold"
                >
                    {kraj
                        ? krajs.find((item) => item.id === kraj)?.name
                        : "Vyberte kraj..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Hledat kraj..." />
                    <CommandList>
                        <CommandEmpty>Kraj nenalezen.</CommandEmpty>
                        <CommandGroup>
                            {krajs.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name}  // Updated to item.name
                                    onSelect={(currentValue) => {
                                        const selectedKraj = krajs.find(k => k.name === currentValue)?.id;
                                        setKraj(selectedKraj === kraj ? "" : selectedKraj);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            kraj === item.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );


};

export default ComboBox;
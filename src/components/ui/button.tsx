import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "@/contexts/ThemeContext"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-heading font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_.material-icons]:pointer-events-none [&_.material-symbols-outlined]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-neutral-900 dark:bg-zinc-900 dark:text-neutral-200 dark:hover:bg-zinc-800 shadow-lg hover:shadow-xl", 
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-400 shadow-lg hover:shadow-xl",
        outline: "border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground dark:border-neutral-600 dark:hover:bg-neutral-800",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-blue-200 dark:text-black dark:hover:bg-neutral-300 shadow-md hover:shadow-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-200",
        link: "text-primary underline-offset-4 hover:underline",
   },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-13 rounded-xl px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error ? "true" : "false"}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500",
          "transition-all duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          error 
            ? "border-red-500 focus-visible:outline-red-500 text-red-900" 
            : "border-gray-300 focus-visible:outline-[var(--accent,#2563eb)] focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

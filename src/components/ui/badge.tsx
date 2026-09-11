import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase transition-colors focus:outline-none", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-black",
      secondary: "border-transparent bg-secondary text-white",
      outline: "text-white border-white/10",
      gold: "bg-primary/10 text-white border-primary/20",
      crimson: "bg-[#A51D2D14] text-white border-[#A51D2D20]",
      muted: "bg-white/5 backdrop-blur text-white border-transparent",
    }
  },
  defaultVariants: { variant: "default" }
})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

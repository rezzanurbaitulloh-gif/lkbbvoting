import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase transition-colors focus:outline-none", {
  variants: {
    variant: {
      default: "border-transparent bg-gold text-gold-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground border-border",
      gold: "bg-[#C9A86A14] text-[#8A6F2F] dark:text-[#D4B77A] border-[#C9A86A30]",
      crimson: "bg-[#A51D2D14] text-[#A51D2D] border-[#A51D2D20]",
      muted: "bg-muted text-muted-foreground border-transparent",
    }
  },
  defaultVariants: { variant: "default" }
})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

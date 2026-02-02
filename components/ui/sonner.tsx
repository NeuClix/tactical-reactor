"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#242b3d] group-[.toaster]:text-[#e2e8f0] group-[.toaster]:border-[#3d4659] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#94a3b8]",
          actionButton:
            "group-[.toast]:bg-[#d4a853] group-[.toast]:text-[#1a1f2e]",
          cancelButton:
            "group-[.toast]:bg-[#2d3548] group-[.toast]:text-[#e2e8f0]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

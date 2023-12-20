import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const FormErrorMessage = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={twMerge("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FormErrorMessage.displayName = "FormErrorMessage";

const FormInfo = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={twMerge("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormInfo.displayName = "FormInfo";

export { FormInfo, FormErrorMessage };

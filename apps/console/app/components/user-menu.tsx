import { useSubmit } from "@remix-run/react";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function UserMenu({
  hasSubscription,
  email,
  name,
  id,
}: {
  hasSubscription: boolean;
  email: string;
  name?: string;
  id: string;
}) {
  const submit = useSubmit();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${id}.svg?size=35&text=${
                name?.charAt(0) ?? email.charAt(0)
              }`}
              alt="Avatar"
            />
            <AvatarFallback>N/A</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* {hasSubscription ? (
          <DropdownMenuItem
            disabled={true}
            className="cursor-pointer line-through"
          >
            Manage Subscription
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              submit(null, {
                method: "POST",
                action: "/subscription/create/checkout",
              })
            }
          >
            Subscribe
          </DropdownMenuItem>
        )} */}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => submit(null, { method: "POST", action: "/logout" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

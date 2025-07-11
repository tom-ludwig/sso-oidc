import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ButtonIcon} from "@/components/ui/button-arrow-left";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Link} from "react-router-dom";
import axios from "axios";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const apiAddress = "http://localhost:8080/oauth/register";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
    } else {
      setError("");
      console.log("Form submitted");
    }

    let username = surname + " " + name;

    try {
      await axios.post(apiAddress, {
        tenant_id: "550e8400-e29b-41d4-a716-446655440003",
        username,
        email,
        password,
      });

      window.location.href = `http://localhost:3000/site`;

    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-wrap items-center">
          <Link to="/login">
            <ButtonIcon />
          </Link>
          <CardTitle>Register for an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <Label
                  htmlFor="surname"
                  className="row-span-1 col-span-1 col-start-1 row-start-1"
                >
                  Surname
                </Label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Mustermann"
                  required
                  className="row-span-1 col-span-1 col-start-1 row-start-2"
                  onChange={(e) => setSurname(e.target.value)}
                />
                <Label
                  htmlFor="name"
                  className="row-span-1 col-span-2 row-start-1 col-start-2"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Max"
                  required
                  className="row-span-1 col-start-2 row-start-2"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Repeat your password</Label>
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      {/*{error && (
        <AlertDialog
          open={!!error}
          onOpenChange={(open) => !open && setError("")}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}*/}
    </div>
  );
}

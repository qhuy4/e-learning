import { cn } from "@fe/lib/utils.ts"
import { Button } from "@fe/components/ui/button.tsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@fe/components/ui/card.tsx"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@fe/components/ui/field.tsx"
import { Input } from "@fe/components/ui/input.tsx"
import {useLogin} from "@/features/auth/hook/useLogin.ts";
import {useState} from "react";
import {Spinner} from "@fe/components/ui/spinner.tsx";
import {useNavigate} from "react-router";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const {
        login,
        loading,
        error,
    } = useLogin();
    const handleSubmit = async ( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        try {
            await login({
                email,
                password,
            });
            navigate("/", {
                replace: true,
            });

        }catch (error) {
            console.error(error);
        }

    };
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password"
                                       value={password}
                                       onChange={(event) =>
                                           setPassword(event.target.value)
                                       } required />
                            </Field>
                            {error && (
                                <p className="text-sm text-red-500">
                                    {error}
                                </p>
                            )}
                            <Field>
                                <Button    disabled={loading}  type="submit">        {loading ? <Spinner /> : "Login"}</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

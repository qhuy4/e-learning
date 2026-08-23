import { Outlet } from "react-router";
import { Header, Footer } from "@fe/components/common";

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

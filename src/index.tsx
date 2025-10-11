/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route, A } from "@solidjs/router";
import Teachers from "./pages/Teachers";
import './App.css'
import Home from "./pages/Home";
import ByDersTeachers from "./pages/ByDers";
import Students from "./pages/Students";
import ByDersStudents from "./pages/ByDersStudents";

const Layout = (props: any) => {
    return (
        <>

            <div class="drawer">
                {/* Checkbox Drawer üçün */}
                <input id="my-drawer" type="checkbox" class="drawer-toggle" />

                {/* Main content */}
                <div class="drawer-content flex flex-col min-h-screen">
                    {/* Navbar */}
                    <div class="w-full navbar bg-primary text-primary-content px-4">
                        {/* Hamburger menü (sadece mobil) */}
                        <div class="flex-none lg:hidden">
                            <label for="my-drawer" class="btn btn-square btn-ghost">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </label>
                        </div>

                        <div class="flex-1 px-2 mx-2 font-bold">📚 Student Management</div>

                        <div class="hidden lg:flex gap-4">
                            <A href="/" class="btn btn-ghost btn-sm">🏠 Ana Səhifə</A>
                            <A href="/students" class="btn btn-ghost btn-sm">👨‍🎓 Tələbələr</A>
                            <A href="/teachers" class="btn btn-ghost btn-sm">👨‍🏫 Teachers</A>
                            <A href="/payments" class="btn btn-ghost btn-sm">💳 Ödənişlər</A>
                            <A href="/settings" class="btn btn-ghost btn-sm">⚙️ Parametrlər</A>
                        </div>
                    </div>

                    <div class="flex-1 p-4">
                        {props.children}
                    </div>
                </div>

                <div class="drawer-side">
                    <label for="my-drawer" class="drawer-overlay"></label>
                    <ul class="menu p-4 w-64 bg-base-200 text-base-content space-y-2">
                        <li><A href="/" class="btn btn-ghost w-full justify-start">🏠 Ana Səhifə</A></li>
                        <li><A href="/students" class="btn btn-ghost w-full justify-start">👨‍🎓 Tələbələr</A></li>
                        <li><A href="/teachers" class="btn btn-ghost w-full justify-start">👨‍🏫 Teachers</A></li>
                        <li><A href="/payments" class="btn btn-ghost w-full justify-start">💳 Ödənişlər</A></li>
                        <li><A href="/settings" class="btn btn-ghost w-full justify-start">⚙️ Parametrlər</A></li>
                    </ul>
                </div>
            </div>

        </>
    );
}

render(() => <Router root={Layout}><Route path="/" component={Home} />
    <Route path="/teachers" component={Teachers} />
    <Route path="/students" component={Students} />
    <Route path="/ders/students/:id" component={ByDersStudents} />
    <Route path="/ders/teachers/:id" component={ByDersTeachers} />

</Router>, document.getElementById("root")!);


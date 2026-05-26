"use client";
import Link from "next/link";
import { LayoutDashboard,Briefcase,Wallet, ArrowLeftRight,PieChart,LineChart, Layout } from "lucide-react";
const links = [
    {
        label: "Dashboard",
        href:"/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Portfolios",
        href:"/portfolios",
        icon: Briefcase
    },
    {
        label: "Accounts",
        href:"/accounts",
        icon: Wallet
    },
    {
        label: "Transactions",
        href:"/transactions",
        icon: ArrowLeftRight
    },
    {
        label: "Holdings",
        href:"/holdings",
        icon: PieChart
    },
    {
        label: "Analytics",
        href:"/analytics",
        icon: LineChart
    },
]


export const Sidebar = ()=>{
    return(
        <aside>
            <div> 
                <h1>PixelFi</h1>
            </div>

            <nav>
                {links.map((link)=>{
                    const Icon = link.icon;
                    return(
                        <Link key={link.href} href={link.href}>
                            <Icon />
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
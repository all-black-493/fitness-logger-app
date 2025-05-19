import React from 'react'
import { MainNav } from "@/components/main-nav"
import { UserNav } from './dashboard/user-nav'

const NavigationSection = () => {
    return (
        <div className="container flex h-16 items-center">
            <div className="container flex h-16 items-center">
                <MainNav />
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav />
                </div>
            </div>
        </div>
    )
}

export default NavigationSection

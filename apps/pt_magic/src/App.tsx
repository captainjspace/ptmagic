import { useState } from 'react'
import './App.css'
import TokenSimulator  from "./tokenSimulator.tsx";
import DataDisplay from "./dataDisplay.tsx"
import { TabItem, Tabs } from "flowbite-react";
import {HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";

export function DashComponent() {
  return (
    <Tabs aria-label="Default tabs" variant="default">
      <TabItem active title="Profile" icon={HiUserCircle}>
        <div className="font-medium text-gray-800 dark:text-white">
          <TokenSimulator />
        </div>
      </TabItem>
      <TabItem title="Data Display" icon={MdDashboard}>
        <div className="font-medium text-gray-800 dark:text-white">
          <DataDisplay />
        </div>
      </TabItem>
    </Tabs>
  );
}



function App() {
  return (
    <>
    <div><DashComponent /> </div>
    </>
  )
}

export default App

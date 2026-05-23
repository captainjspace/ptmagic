import "./App.css";
import "./styles.css";
import TokenSimulator  from "./tokenSimulator.tsx";
import DataDisplay from "./DataDisplayComponent.tsx"
import { TabItem, Tabs } from "flowbite-react";
import {HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";

export function DashComponent() {
  return (
    <div id="pt-dashboard">

<div class="sm:hidden">
    <label for="tabs" class="sr-only">Select your country</label>
    <select id="tabs" class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 py-2.5 shadow-xs placeholder:text-body">
        <option>Profile</option>
        <option>Dashboard</option>
        <option>setting</option>
        <option>Invoice</option>
    </select>
</div>
<ul class="hidden text-sm font-medium text-center text-body sm:flex -space-x-px">
    <li class="w-full focus-within:z-10">
        <a href="#" class="inline-block w-full text-body bg-neutral-primary-soft border border-default rounded-s-base hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-secondary-strong font-medium leading-5 text-sm px-4 py-2.5 focus:outline-none" aria-current="page">Profile</a>
    </li>
    <li class="w-full focus-within:z-10">
        <a href="#" class="inline-block w-full text-body bg-neutral-primary-soft border border-default hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-secondary-strong font-medium leading-5 text-sm px-4 py-2.5 focus:outline-none">Dashboard</a>
    </li>
    <li class="w-full focus-within:z-10">
        <a href="#" class="inline-block w-full text-body bg-neutral-primary-soft border border-default hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-secondary-strong font-medium leading-5 text-sm px-4 py-2.5 focus:outline-none">Settings</a>
    </li>
    <li class="w-full focus-within:z-10">
        <a href="#" class="inline-block w-full text-body bg-neutral-primary-soft border border-default rounded-e-base hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-secondary-strong font-medium leading-5 text-sm px-4 py-2.5 focus:outline-none">Invoice</a>
    </li>
</ul>





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

    </div>
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

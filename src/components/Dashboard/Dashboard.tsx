"use client";

import React from "react";
import CardDataStats from "../CardDataStats";
import { ReceiptText, Clock, Skull, Users } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <CardDataStats title="Total Claims" total="10">
        <ReceiptText className="h-20 w-20 text-primary" />
      </CardDataStats>
      <CardDataStats title="Pending Claims" total="02">
        <Clock className="h-20 w-20 text-primary" />
      </CardDataStats>
      <CardDataStats title="Death Claims" total="01">
        <Skull className="h-20 w-20 text-primary" />
      </CardDataStats>
      <CardDataStats title="Total Dependent" total="08">
        <Users className="h-20 w-20 text-primary" />
      </CardDataStats>
    </div>
  );
};

export default Dashboard;

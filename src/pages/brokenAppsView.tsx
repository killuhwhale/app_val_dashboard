"use client";
import React from "react";
import StackedResult from "~/components/StackedResult";

const BAPage: React.FC<{ collectionName: string }> = ({ collectionName }) => {
  return <StackedResult collectionName="BrokenApps" />;
};

export default BAPage;

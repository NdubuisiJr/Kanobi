import { useEffect } from "react";
import { useRevalidator } from "react-router";

export default function AutoRefresh({ interval = 5000 }) {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const id = setInterval(() => {
      revalidate();
    }, interval);
    return () => clearInterval(id);
  }, [revalidate, interval]);

  return null;
}

/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const intervals: Array<[number, string]> = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatSalary(
  discloseSalary?: boolean,
  min?: number,
  max?: number,
  currency: string = "USD",
  period: string = "year"
): string {
  if (discloseSalary === false) {
    return "Undisclosed";
  }
  if (!min && !max) {
    return "Not disclosed";
  }

  const symbolMap: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
  };
  const sym = symbolMap[currency] || `${currency} `;
  const freq = period === "year" ? "/ yr" : period === "month" ? "/ mo" : "/ hr";

  const formatNum = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (min && max && min !== max) {
    return `${sym}${formatNum(min)} - ${sym}${formatNum(max)} ${freq}`;
  } else if (min) {
    return `${sym}${formatNum(min)}+ ${freq}`;
  } else if (max) {
    return `Up to ${sym}${formatNum(max)} ${freq}`;
  }

  return "Undisclosed";
}


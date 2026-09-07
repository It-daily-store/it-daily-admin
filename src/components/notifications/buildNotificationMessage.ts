import { TNotification } from "@/interface/notification.interface";
import { defaultVerbs, notificationConfig } from "./notificationConfig";

export type TMessageSegment = {
  text: string;
  tone: "actor" | "verb" | "entity";
};

const article = (label: string) =>
  /^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`;

const resolveActor = (noti: TNotification, currentUserId?: string): string => {
  if (currentUserId && noti.userFrom?._id === currentUserId) {
    return "You";
  }

  const { fullName, name } = noti.userFrom || {};
  if (fullName) return fullName;

  const joined = [name?.firstName, name?.middleName, name?.lastName]
    .filter(Boolean)
    .join(" ");

  return joined || "Someone";
};

const buildOrderMessage = (
  actor: string,
  noti: TNotification,
): TMessageSegment[] => {
  const orderNumber = noti.meta?.orderNumber || noti.source;

  if (noti.actionType === "create") {
    return orderNumber
      ? [
          { text: actor, tone: "actor" },
          { text: "placed order", tone: "verb" },
          { text: `#${orderNumber}`, tone: "entity" },
        ]
      : [
          { text: actor, tone: "actor" },
          { text: "placed an order", tone: "verb" },
        ];
  }

  if (noti.meta?.orderStatus && orderNumber) {
    return [
      { text: actor, tone: "actor" },
      { text: "moved order", tone: "verb" },
      { text: `#${orderNumber}`, tone: "entity" },
      { text: `to ${noti.meta.orderStatus}`, tone: "verb" },
    ];
  }

  return orderNumber
    ? [
        { text: actor, tone: "actor" },
        { text: `${defaultVerbs[noti.actionType]} order`, tone: "verb" },
        { text: `#${orderNumber}`, tone: "entity" },
      ]
    : [
        { text: actor, tone: "actor" },
        {
          text: `${defaultVerbs[noti.actionType]} an order`,
          tone: "verb",
        },
      ];
};

export const buildNotificationMessage = (
  noti: TNotification,
  currentUserId?: string,
): TMessageSegment[] => {
  const config = notificationConfig[noti.notificationType];

  // A type this build doesn't know about — lean on the server-derived string.
  if (!config) {
    return noti.text ? [{ text: noti.text, tone: "verb" }] : [];
  }

  const actor = resolveActor(noti, currentUserId);

  if (noti.notificationType === "order") {
    return buildOrderMessage(actor, noti);
  }

  const verb = config.verbs?.[noti.actionType] || defaultVerbs[noti.actionType];
  const label = config.entityLabel;
  const entityName = noti.meta?.entityName;

  if (!entityName) {
    return [
      { text: actor, tone: "actor" },
      { text: `${verb} ${article(label)}`, tone: "verb" },
    ];
  }

  return [
    { text: actor, tone: "actor" },
    { text: `${verb} ${label}`, tone: "verb" },
    { text: entityName, tone: "entity" },
  ];
};

export const flattenMessage = (segments: TMessageSegment[]) =>
  segments.map((segment) => segment.text).join(" ");

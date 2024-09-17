import mixpanel from "mixpanel-browser";

let mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN;

try {
  mixpanel.init(mixpanelToken);
} catch (error) {
  console.error("Error initializing Mixpanel:", error);
}

export const trackLoginEvent = (eventName, user, commonProperties = {}, uncommomProps = {}) => {
  mixpanel.identify(user);
  mixpanel.people.set({
    $name: user,
  });
  const properties = {
    ...commonProperties,
    ...uncommomProps,
  };
  mixpanel.track(eventName, properties);
};

export const trackEvents = (eventName, commonProperties = {}, uncommomProps = {}) => {
  const commonFields = {};
  const properties = {
    product_component: "genesis_portal",
    ...commonFields,
    ...commonProperties,
    ...uncommomProps,
  };
  mixpanel.track(eventName, properties);
};

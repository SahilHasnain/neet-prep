const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getPackageName = () => {
  if (IS_DEV) return "com.sahilhasnain.neuroprep.dev";
  if (IS_PREVIEW) return "com.sahilhasnain.neuroprep.preview";
  return "com.sahilhasnain.neuroprep";
};

const getAppName = () => {
  if (IS_DEV) return "NeuroPrep (Dev)";
  if (IS_PREVIEW) return "NeuroPrep (Preview)";
  return "NeuroPrep";
};

export default {
  expo: {
    name: getAppName(),
    slug: "neuroprep",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/neuro-icon.png",
    scheme: "neuroprep",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getPackageName(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/neuro-icon.png",
        backgroundImage: "./assets/images/neuro-icon.png",
        monochromeImage: "./assets/images/neuro-icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: getPackageName(),
    },
    web: {
      output: "static",
      favicon: "./assets/images/neuro-icon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/neuro-splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "6437f00a-1e41-4ba1-a7fd-9de14cd01445",
      },
    },
  },
};

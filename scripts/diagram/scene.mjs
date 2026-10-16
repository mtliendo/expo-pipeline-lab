const FONT = 2; // Helvetica — cleaner than Virgil for a reference diagram
const LABEL = { fontSize: 16, fontFamily: FONT };
const ARROW_LABEL = { fontSize: 14, fontFamily: FONT };
const TITLE_SIZE = 28;

const BLUE = { strokeColor: '#1971c2', backgroundColor: '#a5d8ff' };
const VIOLET = { strokeColor: '#5f3dc4', backgroundColor: '#d0bfff' };
const CYAN = { strokeColor: '#0b7285', backgroundColor: '#99e9f2' };
const YELLOW = { strokeColor: '#e67700', backgroundColor: '#ffec99' };
const GREEN = { strokeColor: '#2f9e44', backgroundColor: '#b2f2bb' };
const PINK = { strokeColor: '#c2255c', backgroundColor: '#fcc2d7' };
const GRAY = { strokeColor: '#495057', backgroundColor: '#e9ecef' };
const ORANGE = { strokeColor: '#d9480f', backgroundColor: '#ffd8a8' };

function box(id, x, y, width, height, text, colors) {
  return {
    type: 'rectangle',
    id,
    x,
    y,
    width,
    height,
    roughness: 0,
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    ...colors,
    label: { text, ...LABEL },
  };
}

function arrow(id, { x, y, width, height = 0, startId, endId, text, strokeColor = '#343a40' }) {
  return {
    type: 'arrow',
    id,
    x,
    y,
    width,
    height,
    roughness: 0,
    strokeWidth: 2,
    strokeColor,
    startArrowhead: null,
    endArrowhead: 'arrow',
    start: { id: startId },
    end: { id: endId },
    ...(text ? { label: { text, ...ARROW_LABEL } } : {}),
  };
}

function title(id, x, y, text, fontSize = TITLE_SIZE) {
  return {
    type: 'text',
    id,
    x,
    y,
    text,
    fontSize,
    fontFamily: FONT,
    strokeColor: '#212529',
  };
}

export const skeletons = [
  title('title', 80, 24, 'Expo Pipeline Lab — architecture and delivery'),
  title(
    'subtitle',
    80,
    64,
    'Runtime on the left and middle. Delivery pipeline along the bottom. EAS config on the right.',
    16,
  ),

  box(
    'phone',
    80,
    160,
    420,
    250,
    'iPhone app\nExpo SDK 58 · expo-dev-client\nreact-native-auth0\nexpo-camera · expo-sqlite',
    BLUE,
  ),
  box(
    'auth0',
    680,
    160,
    440,
    250,
    'Auth0 tenant: demo-showcase\nNative app: Expo Pipeline Lab\nCustom API audience\nhttps://expo-pipeline-lab.api\nscope: describe:photos',
    VIOLET,
  ),
  box(
    'sqlite',
    80,
    500,
    420,
    160,
    'On-device SQLite\nphotos: id, uri, description,\ntags JSON, created_at',
    GREEN,
  ),
  box(
    'hosting',
    680,
    500,
    440,
    200,
    'EAS Hosting  ·  expo.app\nExpo Router POST /api/describe\njose JWKS verify (Bearer JWT)',
    CYAN,
  ),
  box(
    'gateway',
    1280,
    500,
    400,
    200,
    'Vercel AI Gateway\nAI SDK generateObject + zod\ngoogle/gemini-2.5-flash',
    YELLOW,
  ),

  arrow('a-login', {
    x: 500,
    y: 275,
    width: 180,
    startId: 'phone',
    endId: 'auth0',
    text: 'Universal Login / PKCE',
  }),
  arrow('a-describe', {
    x: 500,
    y: 360,
    width: 180,
    height: 160,
    startId: 'phone',
    endId: 'hosting',
    text: 'POST /api/describe + Bearer',
  }),
  arrow('a-ai', {
    x: 1120,
    y: 590,
    width: 160,
    startId: 'hosting',
    endId: 'gateway',
    text: 'generateObject',
  }),
  arrow('a-save', {
    x: 680,
    y: 560,
    width: -180,
    startId: 'hosting',
    endId: 'sqlite',
    text: 'description + tags',
  }),

  title('delivery-title', 80, 760, 'Delivery pipeline (GitHub → TestFlight)', 20),

  box('github', 80, 820, 200, 130, 'GitHub repo\nmtliendo/\nexpo-pipeline-lab', GRAY),
  box('agent', 330, 820, 230, 130, 'Cloud agent / Focus\nEXPO_TOKEN robot\nDeveloper role', ORANGE),
  box('eas-build', 610, 820, 210, 130, 'EAS Build\nremote iOS creds\ndist cert + profile', PINK),
  box('eas-submit', 870, 820, 210, 130, 'EAS Submit\nASC API key\nassigned on EAS', PINK),
  box('asc', 1130, 820, 190, 130, 'App Store\nConnect\napp 6823490897', GRAY),
  box('testflight', 1370, 820, 200, 130, 'TestFlight\nInternal group\n(Focus added)', BLUE),
  box('device', 1620, 820, 180, 130, 'iPhone\n1.0.0 (3)', BLUE),

  arrow('d1', { x: 280, y: 885, width: 50, startId: 'github', endId: 'agent' }),
  arrow('d2', { x: 560, y: 885, width: 50, startId: 'agent', endId: 'eas-build' }),
  arrow('d3', { x: 820, y: 885, width: 50, startId: 'eas-build', endId: 'eas-submit' }),
  arrow('d4', { x: 1080, y: 885, width: 50, startId: 'eas-submit', endId: 'asc' }),
  arrow('d5', { x: 1320, y: 885, width: 50, startId: 'asc', endId: 'testflight' }),
  arrow('d6', { x: 1570, y: 885, width: 50, startId: 'testflight', endId: 'device' }),

  title('config-title', 80, 1000, 'EAS env vars and Hosting deploys', 20),

  box(
    'env',
    80,
    1060,
    520,
    190,
    'EAS environment variables\nPlain text + Sensitive → Hosting\nSecret never leaves EAS servers\nAI_GATEWAY_API_KEY must be Sensitive',
    ORANGE,
  ),
  box(
    'deploy',
    700,
    1060,
    440,
    190,
    'EAS Hosting deploys\nexpo export -p web\neas deploy [--prod]\npreview + production URLs',
    CYAN,
  ),
  box(
    'notes',
    1240,
    1060,
    560,
    190,
    'Also on EAS: AUTH0_DOMAIN, AUTH0_AUDIENCE\nEXPO_PUBLIC_API_ORIGIN (plaintext)\nHosting cannot deploy Secret vars\nJS-only → EAS Update (not enabled yet)',
    GRAY,
  ),

  arrow('c-env', {
    x: 600,
    y: 1145,
    width: 100,
    startId: 'env',
    endId: 'deploy',
    text: 'feeds API routes',
  }),

  {
    type: 'frame',
    id: 'frame-runtime',
    children: ['phone', 'auth0', 'sqlite', 'hosting', 'gateway'],
    name: 'Runtime: device ↔ Auth0 ↔ Hosting ↔ AI',
  },
  {
    type: 'frame',
    id: 'frame-delivery',
    children: ['github', 'agent', 'eas-build', 'eas-submit', 'asc', 'testflight', 'device'],
    name: 'Delivery: repo → build → TestFlight',
  },
  {
    type: 'frame',
    id: 'frame-config',
    children: ['env', 'deploy', 'notes'],
    name: 'EAS configuration',
  },
];

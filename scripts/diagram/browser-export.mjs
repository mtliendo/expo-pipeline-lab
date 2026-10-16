import { convertToExcalidrawElements, exportToSvg } from '@excalidraw/excalidraw';

window.exportArchitecture = async (skeletons) => {
  const elements = convertToExcalidrawElements(skeletons, { regenerateIds: false });
  if (!Array.isArray(elements)) {
    throw new Error(`convertToExcalidrawElements returned ${typeof elements}`);
  }

  const appState = {
    exportBackground: true,
    viewBackgroundColor: '#ffffff',
    exportWithDarkMode: false,
    exportEmbedScene: false,
  };

  let svg;
  try {
    svg = await exportToSvg({
      elements,
      appState,
      files: {},
      exportPadding: 24,
    });
  } catch (error) {
    throw new Error(`exportToSvg failed: ${error?.message ?? error}`);
  }

  return {
    elements,
    svg: svg.outerHTML,
  };
};

import { Client } from '@gradio/client';

const HF_SPACE = 'tomasdanjo/SLE-SwinSNN-CrossModal-Fusion';

export interface PredictionResult {
    /** e.g. "SLE" or "Healthy" */
    label: string;
    /** Per-class confidences */
    confidences: { label: string; confidence: number }[];
    /** Attention heatmap overlay URL */
    heatmapUrl: string;
    /** Raw numeric value returned by the model */
    rawScore: number;
}

/**
 * Call the HuggingFace Gradio `/predict_and_explain` endpoint.
 *
 * @param imageBlob  - Retinal fundus image (Blob/File)
 * @param geneString - Comma-separated 20 gene expression values
 */
export async function predictAndExplain(
    imageBlob: Blob,
    geneString: string
): Promise<PredictionResult> {
    const client = await Client.connect(HF_SPACE);

    const result = await client.predict('/predict_and_explain', {
        image: imageBlob,
        gene_input_str: geneString,
    });

    // result.data is a tuple of 3 elements:
    // [0] { label, confidences }
    // [1] { url | path } — heatmap image
    // [2] float — raw score
    const [prediction, heatmapImage, rawScore] = result.data as [
        { label: string; confidences: { label: string; confidence: number }[] },
        { url?: string; path?: string },
        number,
    ];

    return {
        label: prediction.label,
        confidences: prediction.confidences ?? [],
        heatmapUrl: heatmapImage.url ?? heatmapImage.path ?? '',
        rawScore,
    };
}

# Hugging Face Model Information: MobileNetV2 PlantVillage

## 1. Overview

- **Model Repository:** [`neghani/plantvillage-mobilenetv2`](https://huggingface.co/neghani/plantvillage-mobilenetv2)
- **Base Architecture:** `MobileNetV2` (`MobileNetV2ForImageClassification`)
- **Number of Parameters:** ~2.2 - 3.5 Million
- **Model Checkpoint Size:** ~14 MB (`model.safetensors`)
- **Primary Domain:** Agricultural Leaf Disease Classification
- **Dataset:** PlantVillage benchmark dataset (14 plant species, 38 condition categories)

---

## 2. Input Preprocessing Pipeline

The model utilizes `MobileNetV2ImageProcessor` (`AutoImageProcessor`):

```json
{
  "image_processor_type": "MobileNetV2ImageProcessor",
  "crop_size": { "height": 224, "width": 224 },
  "size": { "shortest_edge": 256 },
  "do_resize": true,
  "do_center_crop": true,
  "resample": 2,
  "do_rescale": true,
  "rescale_factor": 0.00392156862745098,
  "do_normalize": true,
  "image_mean": [0.5, 0.5, 0.5],
  "image_std": [0.5, 0.5, 0.5]
}
```

### Steps Executed on Uploaded Images:
1. **Format Validation:** Verify file is a valid image (JPG, PNG, WEBP).
2. **RGB Normalization:** Convert palette, grayscale, or transparent channels (RGBA) into 3-channel RGB.
3. **Resize & Center Crop:** Resize shortest edge to 256px, then center-crop to 224×224 pixels.
4. **Rescaling:** Pixel values are divided by 255.0 to map range $[0, 255] \to [0.0, 1.0]$.
5. **Standardization:** Normalized via $(x - \text{mean}) / \text{std}$ with mean $0.5$ and standard deviation $0.5$, centering values in $[-1.0, 1.0]$.
6. **Batch Dimension:** Formats as PyTorch tensor of shape `(1, 3, 224, 224)`.

---

## 3. Supported Classes (Complete 38 Classes)

The model is trained strictly on the 38 classes below. It does not recognize crops or diseases outside this list.

| Index | Exact Model Class Name | Crop | Condition / Disease |
|---|---|---|---|
| `0` | `Apple___Apple_scab` | Apple | Apple Scab |
| `1` | `Apple___Black_rot` | Apple | Black Rot |
| `2` | `Apple___Cedar_apple_rust` | Apple | Cedar Apple Rust |
| `3` | `Apple___healthy` | Apple | Healthy |
| `4` | `Blueberry___healthy` | Blueberry | Healthy |
| `5` | `Cherry_(including_sour)___Powdery_mildew` | Cherry | Powdery Mildew |
| `6` | `Cherry_(including_sour)___healthy` | Cherry | Healthy |
| `7` | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | Corn (Maize) | Gray Leaf Spot |
| `8` | `Corn_(maize)___Common_rust_` | Corn (Maize) | Common Rust |
| `9` | `Corn_(maize)___Northern_Leaf_Blight` | Corn (Maize) | Northern Leaf Blight |
| `10` | `Corn_(maize)___healthy` | Corn (Maize) | Healthy |
| `11` | `Grape___Black_rot` | Grape | Black Rot |
| `12` | `Grape___Esca_(Black_Measles)` | Grape | Esca (Black Measles) |
| `13` | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` | Grape | Leaf Blight |
| `14` | `Grape___healthy` | Grape | Healthy |
| `15` | `Orange___Haunglongbing_(Citrus_greening)` | Orange | Huanglongbing (Citrus Greening) |
| `16` | `Peach___Bacterial_spot` | Peach | Bacterial Spot |
| `17` | `Peach___healthy` | Peach | Healthy |
| `18` | `Pepper,_bell___Bacterial_spot` | Bell Pepper | Bacterial Spot |
| `19` | `Pepper,_bell___healthy` | Bell Pepper | Healthy |
| `20` | `Potato___Early_blight` | Potato | Early Blight |
| `21` | `Potato___Late_blight` | Potato | Late Blight |
| `22` | `Potato___healthy` | Potato | Healthy |
| `23` | `Raspberry___healthy` | Raspberry | Healthy |
| `24` | `Soybean___healthy` | Soybean | Healthy |
| `25` | `Squash___Powdery_mildew` | Squash | Powdery Mildew |
| `26` | `Strawberry___Leaf_scorch` | Strawberry | Leaf Scorch |
| `27` | `Strawberry___healthy` | Strawberry | Healthy |
| `28` | `Tomato___Bacterial_spot` | Tomato | Bacterial Spot |
| `29` | `Tomato___Early_blight` | Tomato | Early Blight |
| `30` | `Tomato___Late_blight` | Tomato | Late Blight |
| `31` | `Tomato___Leaf_Mold` | Tomato | Leaf Mold |
| `32` | `Tomato___Septoria_leaf_spot` | Tomato | Septoria Leaf Spot |
| `33` | `Tomato___Spider_mites Two-spotted_spider_mite` | Tomato | Two-spotted Spider Mite |
| `34` | `Tomato___Target_Spot` | Tomato | Target Spot |
| `35` | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | Tomato | Yellow Leaf Curl Virus |
| `36` | `Tomato___Tomato_mosaic_virus` | Tomato | Tomato Mosaic Virus |
| `37` | `Tomato___healthy` | Tomato | Healthy |

---

## 4. Confidence & Uncertainty Handling

### Softmax Properties:
The model computes logits $\mathbf{z} \in \mathbb{R}^{38}$ and passes them through softmax:
$$\sigma(z_i) = \frac{e^{z_i}}{\sum_{j=1}^{38} e^{z_j}}$$

### Out-of-Distribution (OOD) Critical Limitation:
Because the softmax operation forces all class probabilities to sum to $1.0$ ($100\%$), a completely non-leaf image (such as a car, person, or unsupported plant like rice or wheat) will **still** produce a classification into one of the 38 classes.

### How AgriSense Handles Uncertainty:
1. **Threshold Flagging:** Predictions where the highest class confidence is below `CONFIDENCE_THRESHOLD` (default **50.0%**) are marked with `is_uncertain: true`.
2. **Transparent Alternatives:** The backend always returns the top 3 alternative classes and their exact percentage distribution.
3. **Advisory Warning:** The client receives an explicit message stating that low confidence suggests poor lighting, blur, or an unsupported subject, recommending human verification.
4. **No False Confidence:** The system never claims a low-confidence result is a confirmed diagnosis.

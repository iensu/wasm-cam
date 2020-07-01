extern crate console_error_panic_hook;

mod pixel;
mod transforms;

use std::panic;
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    Ok(())
}

fn calculate_start_index(square_index: u32, square_size: u32, width: u32) -> u32 {
    let squares_per_row = width / square_size;
    let filled_rows = square_index / squares_per_row;
    let current_column = square_index % squares_per_row;

    4 * (filled_rows * squares_per_row * square_size.pow(2) + current_column * square_size)
}

fn calculate_pixel_indices(square_index: u32, square_size: u32, canvas_width: u32) -> Vec<u32> {
    let pixel_width = 4;
    let pixels_per_row = pixel_width * canvas_width;
    let start_index = calculate_start_index(square_index, square_size, canvas_width);

    let mut pixel_indices = vec![0; square_size.pow(2) as usize];

    for square_row in 0..square_size {
        let start = start_index + square_row * pixels_per_row;
        let end = start + pixel_width * square_size;

        for (i, pixel_idx) in (start..end).step_by(pixel_width as usize).enumerate() {
            let offset = (square_row * square_size) as usize;
            pixel_indices[offset + i] = pixel_idx;
        }
    }

    pixel_indices
}

fn apply_transform(
    input: ImageData,
    square_size: u32,
    transform: fn(pixel::PixelSquare) -> pixel::PixelSquare,
) -> Vec<u8> {
    let width = input.width();
    let height = input.height();
    let input_data = input.data();
    let num_squares = (width * height) / square_size.pow(2);

    let mut output: Vec<u8> = vec![0; input_data.len()];

    for sq in 0..num_squares {
        let pixel_indices = calculate_pixel_indices(sq, square_size, width);
        let pixel_square = pixel_indices
            .iter()
            .map(|idx: &u32| pixel::Pixel::new(*idx as usize, &input_data))
            .collect::<pixel::PixelSquare>();

        for pixel::Pixel {
            index,
            color: (r, g, b, a),
        } in transform(pixel_square)
        {
            let i = index as usize;
            output[i + 0] = r;
            output[i + 1] = g;
            output[i + 2] = b;
            output[i + 3] = a;
        }
    }

    output
}

#[wasm_bindgen]
pub fn transform(input: ImageData, square_size: u32, transform: &str) -> Vec<u8> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let transform_fn = match transform {
        "pixelate" => transforms::color_average,
        "greyscale" => transforms::average,
        _ => transforms::identity,
    };

    apply_transform(input, square_size, transform_fn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calculate_pixel_indices_works() {
        assert_eq!(calculate_pixel_indices(0, 2, 8), vec![0, 4, 32, 36]);
        assert_eq!(calculate_pixel_indices(1, 2, 8), vec![8, 12, 40, 44]);
        assert_eq!(calculate_pixel_indices(2, 2, 8), vec![16, 20, 48, 52]);

        assert_eq!(calculate_pixel_indices(4, 2, 8), vec![64, 68, 96, 100]);
    }
}

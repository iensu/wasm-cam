use wasm_bindgen::Clamped;

use crate::pixel::{Pixel, PixelSquare, RgbaColor};

pub fn identity(pixel_square: PixelSquare) -> PixelSquare {
    pixel_square.clone()
}

pub fn average(pixel_square: PixelSquare) -> PixelSquare {
    let num_pixels = pixel_square.len() as u32;
    let total_pixel_strength = pixel_square
        .iter()
        .fold(0, |acc, p| acc + p.color_strength());
    let average = (total_pixel_strength / (num_pixels * 3)) as u8;

    pixel_square
        .iter()
        .map(|p| Pixel {
            index: p.index,
            color: RgbaColor(average, average, average, 255),
        })
        .collect::<PixelSquare>()
}

pub fn color_average(pixel_square: PixelSquare) -> PixelSquare {
    let num_pixels = pixel_square.len() as u32;
    let (r_total, g_total, b_total, a_total) = pixel_square.iter().fold(
        (0, 0, 0, 0),
        |(r_sum, g_sum, b_sum, a_sum),
         Pixel {
             index: _,
             color: RgbaColor(r, g, b, a),
         }| {
            (
                r_sum + u32::from(*r),
                g_sum + u32::from(*g),
                b_sum + u32::from(*b),
                a_sum + u32::from(*a),
            )
        },
    );
    let normalized = RgbaColor(
        (r_total / num_pixels) as u8,
        (g_total / num_pixels) as u8,
        (b_total / num_pixels) as u8,
        (a_total / num_pixels) as u8,
    );

    pixel_square
        .iter()
        .map(|Pixel { index, color: _ }| Pixel {
            index: *index,
            color: normalized,
        })
        .collect::<PixelSquare>()
}

pub fn apply_transform(
    input_data: &Clamped<Vec<u8>>,
    width: u32,
    height: u32,
    square_size: u32,
    transform: fn(PixelSquare) -> PixelSquare,
) -> Vec<u8> {
    let num_squares = (width * height) / square_size.pow(2);
    let mut output = vec![0; input_data.len()];

    for sq in 0..num_squares {
        let pixel_indices = calculate_pixel_indices(sq, square_size, width);
        let pixel_square = pixel_indices
            .iter()
            .map(|idx: &u32| Pixel::new(*idx as usize, input_data))
            .collect::<PixelSquare>();

        for Pixel {
            index,
            color: RgbaColor(r, g, b, a),
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::pixel::RgbaColor;

    #[test]
    fn calculate_pixel_indices_works() {
        assert_eq!(calculate_pixel_indices(0, 2, 8), vec![0, 4, 32, 36]);
        assert_eq!(calculate_pixel_indices(1, 2, 8), vec![8, 12, 40, 44]);
        assert_eq!(calculate_pixel_indices(2, 2, 8), vec![16, 20, 48, 52]);

        assert_eq!(calculate_pixel_indices(4, 2, 8), vec![64, 68, 96, 100]);
    }

    #[test]
    fn identity_works() {
        let orig_pixel_square = (0..4)
            .map(|index| {
                let i = index as u8;
                Pixel {
                    index,
                    color: RgbaColor(10 * i, 20 * i, 30 * i, 40 * i),
                }
            })
            .collect::<PixelSquare>();
        let expected = orig_pixel_square.clone();

        assert_eq!(identity(orig_pixel_square), expected);
    }

    #[test]
    fn color_average_works() {
        let orig_pixel_square = (0..4)
            .map(|index| {
                let i = index as u8;
                Pixel {
                    index,
                    color: RgbaColor(10 * i, 20 * i, 30 * i, 40 * i),
                }
            })
            .collect::<PixelSquare>();
        let averaged_color = RgbaColor(15, 30, 45, 60);
        let expected = (0..4)
            .map(|index| Pixel {
                index,
                color: averaged_color,
            })
            .collect::<PixelSquare>();

        assert_eq!(color_average(orig_pixel_square), expected);
    }

    #[test]
    fn average_works() {
        let orig_pixel_square = (0..4)
            .map(|index| {
                let i = index as u8;
                Pixel {
                    index,
                    color: RgbaColor(10 * i, 20 * i, 30 * i, 40 * i),
                }
            })
            .collect::<PixelSquare>();
        let average_strength = RgbaColor(30, 30, 30, 255);
        let expected = (0..4)
            .map(|index| Pixel {
                index,
                color: average_strength,
            })
            .collect::<PixelSquare>();

        assert_eq!(average(orig_pixel_square), expected);
    }
}

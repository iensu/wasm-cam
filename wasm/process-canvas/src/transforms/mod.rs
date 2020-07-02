use crate::pixel::{Pixel, PixelColor, PixelSquare};

fn get_pixel_color_strength((r, g, b, _): &PixelColor) -> u32 {
    u32::from(*r) + u32::from(*g) + u32::from(*b)
}

pub fn identity(pixel_square: PixelSquare) -> PixelSquare {
    pixel_square.clone()
}

pub fn average(pixel_square: PixelSquare) -> PixelSquare {
    let num_pixels = pixel_square.len() as u32;
    let total_pixel_strength = pixel_square
        .iter()
        .fold(0, |acc, Pixel { index: _, color }| {
            acc + get_pixel_color_strength(color)
        });
    let average = (total_pixel_strength / (num_pixels * 3)) as u8;

    pixel_square
        .iter()
        .map(|p| Pixel {
            index: p.index,
            color: (average, average, average, 255),
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
             color: (r, g, b, a),
         }| {
            (
                r_sum + u32::from(*r),
                g_sum + u32::from(*g),
                b_sum + u32::from(*b),
                a_sum + u32::from(*a),
            )
        },
    );
    let normalized = (
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identity_works() {
        let orig_pixel_square = (0..4)
            .map(|index| {
                let i = index as u8;
                Pixel {
                    index,
                    color: (10 * i, 20 * i, 30 * i, 40 * i),
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
                    color: (10 * i, 20 * i, 30 * i, 40 * i),
                }
            })
            .collect::<PixelSquare>();
        let averaged_color: PixelColor = (15, 30, 45, 60);
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
                    color: (10 * i, 20 * i, 30 * i, 40 * i),
                }
            })
            .collect::<PixelSquare>();
        let average_strength: PixelColor = (30, 30, 30, 255);
        let expected = (0..4)
            .map(|index| Pixel {
                index,
                color: average_strength,
            })
            .collect::<PixelSquare>();

        assert_eq!(average(orig_pixel_square), expected);
    }
}

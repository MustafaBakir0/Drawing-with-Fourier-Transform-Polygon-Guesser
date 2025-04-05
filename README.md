
# Design

Initially, before implementing any program, you have to design proper pseudocode and sometimes a flowchart to aid with coding your project.

I first did my research on the topic, from a page in Wikipedia, which gave me some general ideas of the mathematical concepts used to utilize Discrete Fourier Transformation. I then watched this YouTube video to get a better idea of how to design and implement the DFT algorithm. Moreover, this article gave me more insight on the topic.

I didn’t need to do any sketches as the videos and blogs I watched and read gave me a rough idea. I only had to design the algorithms I was going to use.

## 1. Resample Function

**Description:** Resamples an array of points to have \( n \) evenly spaced points along the path.

**Input:**
- `points[]`: Array of points (e.g. p5.js vectors).
- \( n \): Number of points to resample to.

**Output:**
- `newPoints[]`: Resampled array of \( n \) evenly spaced points.

```latex
\begin{algorithm}[H]
\DontPrintSemicolon
\SetKwFunction{Resample}{Resample}
\SetKwProg{Fn}{Function}{:}{\KwRet newPoints}
\Fn{\Resample{points[], n}}{
    \uIf{length(\(points\)) \(< 2\)}{
        \Return \(points\)
    }
    totalLength \(\leftarrow 0\)\;
    \For{\(i \gets 1\) \textbf{to} length(\(points\)) \(- 1\)}{
        totalLength \(\leftarrow\) totalLength \(+\) Distance(\(points[i-1],\, points[i]\))\;
    }
    interval \(\leftarrow \dfrac{\text{totalLength}}{n-1}\)\;
    newPoints \(\leftarrow [\,points[0]\,]\)\;
    \(d \leftarrow 0\)\;
    \For{\(i \gets 1\) \textbf{to} length(\(points\)) \(- 1\)}{
        prev \(\leftarrow points[i-1]\)\;
        curr \(\leftarrow points[i]\)\;
        segmentDist \(\leftarrow\) Distance(prev, curr)\;
        \While{\(d + \text{segmentDist} \ge \text{interval}\)}{
            \(t \leftarrow \dfrac{\text{interval} - d}{\text{segmentDist}}\)\;
            \(nx \leftarrow \text{Lerp}(prev.x,\, curr.x,\, t)\)\;
            \(ny \leftarrow \text{Lerp}(prev.y,\, curr.y,\, t)\)\;
            newPoint \(\leftarrow\) CreateVector(\(nx,\, ny\))\;
            Append newPoint to newPoints\;
            prev \(\leftarrow\) newPoint\;
            segmentDist \(\leftarrow\) Distance(prev, curr)\;
            \(d \leftarrow 0\)\;
        }
        \(d \leftarrow d + \text{segmentDist}\)\;
    }
    \Return newPoints\;
}
\caption{Resample(points[], n)}
\end{algorithm}
```

## 2. Discrete Fourier Transform (DFT) Function

**Description:** Computes the Discrete Fourier Transform (DFT) of an array of complex numbers, adjusting the frequency for indices greater than \(N/2\).

**Input:**
- `x[]`: Array of complex numbers represented by objects `{ re, im }` (real and imaginary parts).

**Output:**
- `X[]`: Array of DFT coefficients with frequency, amplitude, and phase information.

Recall that the Fourier coefficient for index \( k \) is given by

\[
X[k] = \frac{1}{N} \sum_{n=0}^{N-1} x[n]\, e^{-i\, \frac{2\pi k n}{N}},
\]

which in real/imaginary parts becomes:

\[
\begin{aligned}
\text{re} &= \frac{1}{N} \sum_{n=0}^{N-1} \Bigl( x[n].\text{re} \cdot \cos\left(\frac{2\pi k n}{N}\right) + x[n].\text{im} \cdot \sin\left(\frac{2\pi k n}{N}\right) \Bigr), \\
\text{im} &= \frac{1}{N} \sum_{n=0}^{N-1} \Bigl( -x[n].\text{re} \cdot \sin\left(\frac{2\pi k n}{N}\right) + x[n].\text{im} \cdot \cos\left(\frac{2\pi k n}{N}\right) \Bigr).
\end{aligned}
\]
```

(Other sections would follow similarly — due to space, we are saving up to this part.)

Now, saving this content into a `.txt` file.

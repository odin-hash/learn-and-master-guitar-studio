# Generator for complete Learn & Master Guitar exercises database
$out = "exercises.js"

$builderScript = @'
# Helper to create note/rest beat object
function B($b, $n, $sym, $t, $s, $f, $fin, $p, $tip) {
    $sStr = if ($s -eq $null) { "null" } elseif ($s -is [string]) { "`"$s`"" } else { "$s" }
    $fStr = if ($f -eq $null) { "null" } else { "$f" }
    $finStr = if ($fin -eq $null) { "null" } else { "$fin" }
    return "{ beat: $b, note: `"$n`", symbol: `"$sym`", type: `"$t`", string: $sStr, fret: $fStr, finger: $finStr, pick: `"$p`", tip: `"$tip`" }"
}

# Helper for whole note measure
function WholeMeasure($m, $n, $s, $f, $fin, $p, $tip) {
    $b1 = B 1 $n "𝅝" "play" $s $f $fin $p $tip
    $b2 = B 2 $n "𝅝" "play" $s $f $fin "—" "Hold note (Beat 2 of 4)"
    $b3 = B 3 $n "𝅝" "play" $s $f $fin "—" "Hold note (Beat 3 of 4)"
    $b4 = B 4 $n "𝅝" "play" $s $f $fin "—" "Hold note (Beat 4 of 4)"
    return "{ measure: $m, beats: [ $b1, $b2, $b3, $b4 ] }"
}

# Helper for half note measure
function HalfMeasure($m, $n1, $s1, $f1, $fin1, $p1, $tip1, $n2, $s2, $f2, $fin2, $p2, $tip2) {
    $b1 = B 1 $n1 "𝅗𝅥" "play" $s1 $f1 $fin1 $p1 $tip1
    $b2 = B 2 $n1 "𝅗𝅥" "play" $s1 $f1 $fin1 "—" "Hold (Beat 2)"
    $b3 = B 3 $n2 "𝅗𝅥" "play" $s2 $f2 $fin2 $p2 $tip2
    $b4 = B 4 $n2 "𝅗𝅥" "play" $s2 $f2 $fin2 "—" "Hold (Beat 4)"
    return "{ measure: $m, beats: [ $b1, $b2, $b3, $b4 ] }"
}

# Helper for quarter note measure
function QuarterMeasure($m, $beatsList) {
    $bStr = ($beatsList -join ", ")
    return "{ measure: $m, beats: [ $bStr ] }"
}

# Rest beat
function RestBeat($b, $sym, $tip) {
    return B $b "Rest" $sym "rest" $null $null $null "—" $tip
}
'@

Write-Host "Helper defined"

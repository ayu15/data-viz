/* tslint:disable */
import '../styles/c9.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
import * as topojson from '../../dataset/topojson.min'
// @ts-ignore
import customData from '../../dataset/custom.topo.json'

const Chart10 = () => {
  let svg, path, projection, choroplethEnabled, currentlySelectedCountry, countryGroup, cityGroup
  let geojson = topojson.feature(customData, customData.objects['custom.geo'])
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  }

  let chartHeight, chartWidth
  const defaultScale = 1
  const defaultTranslate = [0, 0]
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  let scale = defaultScale
  let translate = defaultTranslate

  const listener = d3.drag()
  listener.on('drag', () => {
    translate = [translate[0] + d3.event.dx, translate[1] + d3.event.dy]
    svg.attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
  })

  const moveTooltip = (x, y, country) => {
    tooltip
      .html(
        `
      <strong class='title'>${country.properties.name}</strong><br/>
      <strong>GDP Per capita:</strong> ${Math.floor(gdpPerCapita(country))} USD
      `
      )
      .style('left', x + 0 + 'px')
      .style('top', y + chartHeight / 2 + 'px')
      .transition()
      .duration(200)
      .style('opacity', 1)
  }

  const removeTooltip = () => {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0)
  }

  const gdpPerCapita = country => {
    return (country.properties.gdp_md_est * 1e6) / country.properties.pop_est
  }

  const getGdpPerCapitaRange = countries => {
    let min = Infinity
    let max = -Infinity

    countries.forEach(country => {
      const gpc = gdpPerCapita(country)
      if (gpc < min) {
        min = gpc
      }
      if (gpc > max) {
        max = gpc
      }
    })

    return { min, max }
  }

  const { min, max } = getGdpPerCapitaRange(geojson.features)

  const getScale = (min, max) => {
    const scale = d3.scaleSequential(d3.interpolatePurples)
    scale.domain([min, max])
    return scale
  }

  const transformCoordinates = ([x, y]) => {
    return [scale * x + translate[0], scale * y + translate[1]]
  }

  const denormalizeCities = cities => {
    const cityMap = {}
    cities.forEach(city => {
      if (!cityMap[city.iso3]) {
        cityMap[city.iso3] = [city]
        return
      }
      cityMap[city.iso3].push(city)
    })

    Object.keys(cityMap).forEach(country => {
      cityMap[country] = cityMap[country].sort((c1, c2) => Number(c1.population) < Number(c2.population)).slice(0, 5)
    })
    return cityMap
  }

  const attachCities = (topology, cities) => {
    const cityMap = denormalizeCities(cities)
    topology.objects['custom.geo'].geometries.forEach(country => {
      country.properties.cities = cityMap[country.properties.iso_a3] || []
    })
    return topology
  }

  const getTransformation = country => {
    if (currentlySelectedCountry === country.properties.iso_a3) {
      return { newScale: defaultScale, newTranslate: defaultTranslate }
    }
    const path = d3.geoPath().projection(projection)
    const bounds = path.bounds(country)
    const newWidth = bounds[1][0] - bounds[0][0]
    const newHeight = bounds[1][1] - bounds[0][1]
    const centerX = (bounds[0][0] + bounds[1][0]) / 2
    const centerY = (bounds[0][1] + bounds[1][1]) / 2
    const newScale = 0.8 / Math.max(newWidth / chartWidth, newHeight / chartHeight)
    const newTranslate = [chartWidth / 2 - newScale * centerX, chartHeight / 2 - newScale * centerY]
    return { newScale, newTranslate }
  }

  const zoomToCountry = country => {
    const { newScale, newTranslate } = getTransformation(country)
    scale = newScale
    translate = newTranslate
    svg
      .transition()
      .duration(750)
      .on('start', () => {
        cityGroup.selectAll('circle').remove()
        cityGroup.selectAll('text').remove()
      })
      .on('end', () => {
        if (currentlySelectedCountry !== country.properties.iso_a3) {
          drawCitiesForCountry(country)
          currentlySelectedCountry = country.properties.iso_a3
          return
        }
        currentlySelectedCountry = null
      })
      .attr('transform', 'translate(' + newTranslate + ')scale(' + newScale + ')')
  }

  const drawCitiesForCountry = country => {
    cityGroup
      .selectAll('circle')
      .data(country.properties.cities)
      .enter()
      .append('circle')
      .attr('r', '2')
      .attr('cx', city => projection([city.lng, city.lat])[0])
      .attr('cy', city => projection([city.lng, city.lat])[1])

    const textSize = 5
    cityGroup
      .selectAll('text')
      .data(country.properties.cities)
      .enter()
      .append('text')
      .attr('x', city => projection([city.lng, city.lat])[0])
      .attr('y', city => projection([city.lng, city.lat])[1])
      .attr('font-size', textSize + 'px')
      .attr('transform', `translate(3, ${textSize / 2})`)
      .text(city => city.city)
  }

  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const setMapBase = topology => {
      const { height, width } = document.getElementById('map-container').getBoundingClientRect()
      console.log('height width of bouding client is', height, width)
      chartHeight = height
      chartWidth = width
      geojson = topojson.feature(topology, topology.objects['custom.geo'])
      svg = d3
        .select('#map-container')
        .append('svg')
        .attr('id', 'map')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
      projection = d3.geoAlbers()
      path = d3.geoPath().projection(projection)
      projection.rotate(-75).fitExtent([[0, 0], [width, height]], geojson)
      svg.call(listener)
      countryGroup = svg.append('g')
      cityGroup = svg.append('g')
    }

    const drawCountries = () => {
      const country = countryGroup
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('stroke', 'white')
        .attr('fill', 'lightgray')
        .on('mouseover', (d, i, countries) => {
          if (!choroplethEnabled) {
            d3.select(countries[i])
              .transition()
              .attr('fill', 'darkgrey')
          }
          const [x, y] = transformCoordinates(path.centroid(d))
          moveTooltip(x, y, d)
          d3.select(`#city_${d.properties.iso_a3}`).style('opacity', 1)
        })
        .on('mouseout', (d, i, countries) => {
          if (!choroplethEnabled) {
            d3.select(countries[i])
              .transition()
              .attr('fill', 'lightgrey')
          }
          removeTooltip()
          d3.select(`#city_${d.properties.iso_a3}`).style('opacity', 0)
        })
        .on('click', zoomToCountry)
      return country
    }

    const drawLegend = () => {
      const gradient = svg
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

      const lowColor = d3.interpolatePurples(0)
      const highColor = d3.interpolatePurples(1)
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', highColor)
        .attr('stop-opacity', 1)

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lowColor)
        .attr('stop-opacity', 1)

      const w = 20
      const h = 200

      const legend = svg
        .append('g')
        .attr('id', 'map-legend')
        .attr('transform', 'translate(30,30)')

      legend
        .append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'url(#gradient')

      const axisScale = d3
        .scaleLinear()
        .range([h, 0])
        .domain([min, max])
      const axis = d3.axisRight(axisScale)
      legend
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${w}, 0)`)
        .call(axis)
    }

    const removeLegend = () => {
      d3.select('#map-legend').remove()
    }

    const drawBubbles = countryGroup => {
      const path = d3.geoPath().projection(projection)
      const scale = d3
        .scaleLinear()
        .range([5, 35])
        .domain([min, max])
      svg
        .append('g')
        .attr('id', 'map-bubbles')
        .selectAll('circle')
        .data(geojson.features)
        .enter()
        .append('circle')
        .attr('cx', d => path.centroid(d)[0])
        .attr('cy', d => path.centroid(d)[1])
        .attr('fill', 'green')
        .attr('stroke', 'black')
        .transition()
        .duration(200)
        .attr('r', d => scale(gdpPerCapita(d)))
    }

    const removeBubbles = () => {
      d3.select('#map-bubbles').remove()
    }

    const colorCountries = countryGroup => {
      const scale = getScale(min, max)
      countryGroup
        .transition()
        .duration(200)
        .attr('fill', country => {
          return scale(gdpPerCapita(country))
        })
      choroplethEnabled = true
    }

    const discolorCountries = countryGroup => {
      countryGroup
        .transition()
        .duration(200)
        .attr('fill', 'lightgrey')
      choroplethEnabled = false
    }

    d3.csv('cities.csv').then(cities => {
      const citiesData = attachCities(customData, cities)
      setMapBase(citiesData)
      const countryGroup = drawCountries()
      document.getElementById('checkbox-choropleth').addEventListener('click', (e: any) => {
        const { checked } = e.target
        if (checked) {
          colorCountries(countryGroup)
          drawLegend()
        } else {
          discolorCountries(countryGroup)
          removeLegend()
        }
      })

      document.getElementById('checkbox-bubble').addEventListener('click', (e: any) => {
        const { checked } = e.target
        if (checked) {
          drawBubbles(countryGroup)
        } else {
          removeBubbles()
        }
      })
    })
  }
  return (
    <Layout>
      <SEO title="Chart 10" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Zooming and panning in map</h1>
      <div className="container">
        <div className="map-container" id="map-container" />
        <div className="control-panel">
          <input type="checkbox" name="choropleth" id="checkbox-choropleth" /> Display Choropleth
          <br />
          <input type="checkbox" name="bubble" id="checkbox-bubble" /> Display Bubble Map
          <br />
        </div>
      </div>
    </Layout>
  )
}

export default Chart10

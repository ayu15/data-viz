/* tslint:disable */
import '../styles/c9.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
import * as topojson from '../../dataset/topojson.min'
// @ts-ignore
import customData from '../../dataset/custom.topo.json'

const Chart9 = () => {
  let svg, path, projection, choroplethEnabled
  const geojson = topojson.feature(customData, customData.objects['custom.geo'])
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  }
  const width = 900 - margin.left - margin.right
  const height = 600 - margin.top - margin.bottom
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  const moveTooltip = (x, y, country) => {
    tooltip
      .html(
        `
      <strong class='title'>${country.properties.name}</strong><br/>
      <strong>GDP Per capita:</strong> ${Math.floor(gdpPerCapita(country))} USD
      `
      )
      .style('left', x + 0 + 'px')
      .style('top', y + height / 2 + 'px')
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

  const cityLabel = (city, i) => {
    return `label_${city.city}_${i}`
  }

  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const setMapBase = () => {
      svg = d3
        .select('body')
        .append('svg')
        .attr('id', 'map')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
      projection = d3.geoAlbers()
      path = d3.geoPath().projection(projection)
      projection.rotate(-75).fitExtent([[0, 0], [width, height]], geojson)
    }

    const drawCountries = () => {
      const countryGroup = svg
        .append('g')
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
          const [x, y] = path.centroid(d)
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
      return countryGroup
    }

    const drawCapitals = capitals => {
      const circleRadius = 5
      const capitalGroup = svg.append('g')
      const capitalGroups = capitalGroup
        .selectAll('circle')
        .data(capitals)
        .enter()
        .append('g')
        .attr('id', city => 'city_' + city.iso3)
        .attr('class', '')
        .style('opacity', 0)

      capitalGroups
        .append('circle')
        .attr('cx', city => projection([city.lng, city.lat])[0])
        .attr('cy', city => projection([city.lng, city.lat])[1])
        .attr('r', circleRadius + 'px')
        .attr('fill', 'tomato')

      const textSize = 10

      capitalGroups
        .append('text')
        .attr('x', city => projection([city.lng, city.lat])[0])
        .attr('y', city => projection([city.lng, city.lat])[1])
        .attr('font-size', textSize + 'px')
        .attr('transform', `translate(7, ${textSize / 2})`)
        .text(city => city.city)

      return capitalGroup
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

    const addLabel = (city, i, cities) => {
      const textSize = 10
      this.svg
        .append('text')
        .attr('id', cityLabel(city, i))
        .attr('x', this.projection([city.lng, city.lat])[0])
        .attr('y', this.projection([city.lng, city.lat])[1])
        .attr('font-size', textSize + 'px')
        .attr('transform', `translate(7, ${textSize / 2})`)
        .text(city.city)

      d3.select(cities[i])
        .transition()
        .duration(200)
        .attr('r', '7')
    }

    const removeLabel = (city, i, cities) => {
      d3.select('#' + cityLabel(city, i)).remove()
      d3.select(cities[i])
        .transition()
        .duration(200)
        .attr('r', '5')
    }

    d3.csv('capitals.csv').then(capitalsData => {
      setMapBase()
      const countryGroup = drawCountries()
      drawCapitals(capitalsData)
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
      <SEO title="Chart 9" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Interactivity in map</h1>
      <div id="c9">
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

export default Chart9

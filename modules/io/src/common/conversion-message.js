// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {cloneDeep, isEqual} from 'lodash';

const circleObj = {
  count: 0, //数量
  object_ids: [], // id列表
  centers: [], //中心点坐标（二维数组）
  z_value: 0, //中心点z值
  radius: [], //半径
  styles: [], //style列表
  style_indexs: [], //style索引值
  classes: [], //class列表
  class_indexs: [] //class索引值
};

//polyline/polygon数据结构一致
const polylineObj = {
  count: 0, //数量
  object_ids: [], // id列表
  vertices: [], // 点坐标（二维数组）
  point_counts: [], //每个feature的点数量
  z_value: 0, //点坐标z值
  styles: [], //style列表
  style_indexs: [], //style索引值
  classes: [], //class列表
  class_indexs: [] //class索引值
};

/**
 * 数据格式转换
 * @param message
 */
export const conversion_message = message => {
  const primitives = message?.data?.updates?.[0].primitives;

  for (let key in primitives) {
    const primitive = primitives[key];
    const circles = primitive.circles;
    if (circles && circles.length) {
      const circle_obj = cloneDeep(circleObj);
      circles.forEach(item => {
        const {center, high_precision_center, radius, base} = item;
        const {object_id = '', style = {}, classes = []} = base;
        circle_obj.count++;
        circle_obj.object_ids.push(object_id);

        if (center) {
          circle_obj.centers.push(center[0]);
          circle_obj.centers.push(center[1]);
          circle_obj.z_value = center[2];
        }

        if (high_precision_center) {
          if(!circle_obj.high_precision_center) circle_obj.high_precision_center = [];
          circle_obj.high_precision_center.push(high_precision_center[0]);
          circle_obj.high_precision_center.push(high_precision_center[1]);
          circle_obj.z_value = high_precision_center[2];
        }

        circle_obj.radius.push(radius);
        const styleIndex = circle_obj.styles.findIndex(ele => isEqual(ele, style));
        if (styleIndex !== -1) {
          circle_obj.style_indexs.push(styleIndex);
        } else {
          circle_obj.styles.push(style);
          circle_obj.style_indexs.push(circle_obj.styles.length - 1);
        }

        const classes_str = JSON.stringify(classes);
        const classIndex = circle_obj.classes.findIndex(ele => isEqual(ele, classes_str));
        if (classIndex !== -1) {
          circle_obj.class_indexs.push(classIndex);
        } else {
          circle_obj.classes.push(classes_str);
          circle_obj.class_indexs.push(circle_obj.classes.length - 1);
        }
      });
      primitive.circles = [];
      primitive.conversion_circles = circle_obj;
    }

    const polylines = primitive.polylines;
    if (polylines && polylines.length) {
      const polyline_obj = cloneDeep(polylineObj);
      polylines.forEach((item, index) => {
        const {vertices, high_precision_vertices, base} = item;
        const {object_id = '', style = {}, classes = []} = base;
        polyline_obj.count++;
        polyline_obj.object_ids.push(object_id);
        let point_count = 0;

        if (vertices) {
          vertices?.forEach(point => {
            point_count++;
            polyline_obj.vertices.push(point[0]);
            polyline_obj.vertices.push(point[1]);
            polyline_obj.z_value = point[2];
          });
        }

        if (high_precision_vertices) {
          if(!polyline_obj.high_precision_vertices) polyline_obj.high_precision_vertices = [];
          high_precision_vertices.forEach(point => {
            polyline_obj.high_precision_vertices.push(point[0]);
            polyline_obj.high_precision_vertices.push(point[1]);
            polyline_obj.z_value = point[2];
          });
        }
        polyline_obj.point_counts.push(point_count);

        const styleIndex = polyline_obj.styles.findIndex(ele => isEqual(ele, style));
        if (styleIndex !== -1) {
          polyline_obj.style_indexs.push(styleIndex);
        } else {
          polyline_obj.styles.push(style);
          polyline_obj.style_indexs.push(polyline_obj.styles.length - 1);
        }

        const classes_str = JSON.stringify(classes);
        const classIndex = polyline_obj.classes.findIndex(ele => isEqual(ele, classes_str));
        if (classIndex !== -1) {
          polyline_obj.class_indexs.push(classIndex);
        } else {
          polyline_obj.classes.push(classes_str);
          polyline_obj.class_indexs.push(polyline_obj.classes.length - 1);
        }
      });
      primitive.polylines = [];
      primitive.conversion_polylines = polyline_obj;
    }

    const polygons = primitive.polygons;
    if (polygons && polygons.length) {
      const polygon_obj = cloneDeep(polylineObj);
      polygons.forEach((item, index) => {
        const {vertices, high_precision_vertices, base} = item;
        const {object_id = '', style = {}, classes = []} = base;
        polygon_obj.count++;
        polygon_obj.object_ids.push(object_id);
        let point_count = 0;
        if (vertices) {
          vertices.forEach(point => {
            point_count++;
            polygon_obj.vertices.push(point[0]);
            polygon_obj.vertices.push(point[1]);
            polygon_obj.z_value = point[2];
          });
        }

        if (high_precision_vertices) {
          if(!polygon_obj.high_precision_vertices) polygon_obj.high_precision_vertices = [];
          high_precision_vertices.forEach(point => {
            polygon_obj.high_precision_vertices.push(point[0]);
            polygon_obj.high_precision_vertices.push(point[1]);
            polygon_obj.z_value = point[2];
          });
        }

        polygon_obj.point_counts.push(point_count);

        const styleIndex = polygon_obj.styles.findIndex(ele => isEqual(ele, style));
        if (styleIndex !== -1) {
          polygon_obj.style_indexs.push(styleIndex);
        } else {
          polygon_obj.styles.push(style);
          polygon_obj.style_indexs.push(polygon_obj.styles.length - 1);
        }

        const classes_str = JSON.stringify(classes);
        const classIndex = polygon_obj.classes.findIndex(ele => isEqual(ele, classes_str));
        if (classIndex !== -1) {
          polygon_obj.class_indexs.push(classIndex);
        } else {
          polygon_obj.classes.push(classes_str);
          polygon_obj.class_indexs.push(polygon_obj.classes.length - 1);
        }
      });
      primitive.polygons = [];
      primitive.conversion_polygons = polygon_obj;
    }
  }

  return message;
};

export const d_conversion_message = message => {
  const primitives = message?.data?.updates?.[0].primitives;

  for (let key in primitives) {
    const primitive = primitives[key];
    //将转换后的格式再转回去
    const conversion_polylines = primitive.conversion_polylines;
    if (conversion_polylines) {
      primitive.polylines = [];
      const {
        count,
        object_ids,
        vertices,
        high_precision_vertices,
        point_counts,
        z_value,
        styles,
        style_indexs,
        classes,
        class_indexs
      } = conversion_polylines;
      for (let i = 0; i < count; ++i) {
        const polyline = {
          vertices: [],
          base: {}
        };
        if (vertices && vertices.length) {
          const point_count = point_counts[i];
          for (let k = 0; k < point_count; ++k) {
            const x = vertices.shift();
            const y = vertices.shift();
            polyline.vertices.push(x);
            polyline.vertices.push(y);
            polyline.vertices.push(z_value);
          }
        }
        if (high_precision_vertices && high_precision_vertices.length) {
          const point_count = point_counts[i];
          polyline.high_precision_vertices = [];
          for (let k = 0; k < point_count; ++k) {
            const x = high_precision_vertices.shift();
            const y = high_precision_vertices.shift();
            polyline.high_precision_vertices.push(x);
            polyline.high_precision_vertices.push(y);
            polyline.high_precision_vertices.push(z_value);
          }
        }
        polyline.base.object_id = object_ids[i] || '0';
        polyline.base.style = styles[style_indexs[i]];
        polyline.base.classes = JSON.parse(classes[class_indexs[i]]);
        primitive.polylines.push(polyline);
      }
      delete primitive.conversion_polylines;
    }

    const conversion_polygons = primitive.conversion_polygons;
    if (conversion_polygons) {
      primitive.polygons = [];
      const {
        count,
        object_ids,
        vertices,
        high_precision_vertices,
        point_counts,
        z_value,
        styles,
        style_indexs,
        classes,
        class_indexs
      } = conversion_polygons;
      for (let i = 0; i < count; ++i) {
        const polygon = {
          vertices: [],
          base: {}
        };
        if (vertices && vertices.length) {
          const point_count = point_counts[i];
          for (let k = 0; k < point_count; ++k) {
            const x = vertices.shift();
            const y = vertices.shift();
            polygon.vertices.push(x);
            polygon.vertices.push(y);
            polygon.vertices.push(z_value);
          }
        }
        if (high_precision_vertices && high_precision_vertices.length) {
          const point_count = point_counts[i];
          polygon.high_precision_vertices = [];
          for (let k = 0; k < point_count; ++k) {
            const x = high_precision_vertices.shift();
            const y = high_precision_vertices.shift();
            polygon.high_precision_vertices.push(x);
            polygon.high_precision_vertices.push(y);
            polygon.high_precision_vertices.push(z_value);
          }
        }
        polygon.base.object_id = object_ids[i] || '0';
        polygon.base.style = styles[style_indexs[i]];
        polygon.base.classes = JSON.parse(classes[class_indexs[i]]);
        primitive.polygons.push(polygon);
      }
      delete primitive.conversion_polygons;
    }

    const conversion_circles = primitive.conversion_circles;
    if (conversion_circles) {
      primitive.circles = [];
      const {
        count,
        object_ids,
        centers,
        high_precision_centers,
        z_value,
        radius,
        styles,
        style_indexs,
        classes,
        class_indexs
      } = conversion_circles;
      for (let i = 0; i < count; ++i) {
        const circle = {
          radius: 0,
          base: {}
        };
        if (centers && centers.length) {
          const x = centers.shift();
          const y = centers.shift();
          circle.center = [x, y, z_value];
        }
        if (high_precision_centers && high_precision_centers.length) {
          const x = high_precision_centers.shift();
          const y = high_precision_centers.shift();
          circle.high_precision_center = [x, y, z_value];
        }
        circle.radius = radius[i];
        circle.base.object_id = object_ids[i] || '0';
        circle.base.style = styles[style_indexs[i]];
        circle.base.classes = JSON.parse(classes[class_indexs[i]]);
        primitive.circles.push(circle);
      }
      delete primitive.conversion_circles;
    }
  }

  return message;
};

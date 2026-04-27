"use client";

import { useEffect, useState } from "react";

import { getActiveAcademicYear } from "@/services/academicYear";
import { getStudentsByUserId } from "@/services/studentRecordService";
import {
  getAssessmentsByStudent,
  getStudentsByClass,
} from "@/services/assessmentService";
import { getCourseMatrix } from "@/services/subjectService";
import { getCourseById } from "@/services/courseService";
import { getClassById } from "@/services/classService";
import { getAcademicQuartersByYear } from "@/services/academicQuarter";

function parseNumericGrade(value) {
  const grade = Number(value);
  return Number.isFinite(grade) ? grade : null;
}

function normalizeStudentRecord(record) {
  const courseName =
    record?.course?.name ||
    record?.cursoNome ||
    record?.curso?.name ||
    record?.curso ||
    record?.courseName ||
    record?.course ||
    "—";

  const turmaName =
    record?.turma ||
    record?.class ||
    record?.className ||
    record?.classe ||
    record?.turmaNome ||
    record?.classLabel ||
    "—";

  return {
    ...record,
    courseName,
    turmaName,
  };
}

function computeStudentRanking(students, currentStudentId) {
  if (!students?.length) {
    return { position: null, total: students?.length || 0, average: null };
  }

  const rankingList = students.map((student) => {
    const allGrades = student.assessments
      .map((assessment) => parseNumericGrade(assessment.grades?.mt))
      .filter((mt) => mt != null);

    const average = allGrades.length
      ? allGrades.reduce((sum, value) => sum + value, 0) / allGrades.length
      : null;

    return {
      studentId: student.studentId,
      average,
    };
  });

  const sorted = [...rankingList]
    .filter((item) => item.average != null)
    .sort((a, b) => b.average - a.average);

  const position =
    sorted.findIndex((item) => item.studentId === currentStudentId) + 1;
  const current = rankingList.find(
    (item) => item.studentId === currentStudentId,
  );

  return {
    position: position || null,
    total: students.length,
    average: current?.average ?? null,
  };
}

function buildQuarterSeries(studentAssessments, classAssessments = []) {
  const studentQuarters = {};
  const classQuarters = {};

  studentAssessments.forEach((assessment) => {
    if (!assessment.quarterNumber) return;
    const mt = parseNumericGrade(assessment.grades?.mt);
    if (mt != null) {
      if (!studentQuarters[assessment.quarterNumber]) {
        studentQuarters[assessment.quarterNumber] = { total: 0, count: 0 };
      }
      studentQuarters[assessment.quarterNumber].total += mt;
      studentQuarters[assessment.quarterNumber].count += 1;
    }
  });

  classAssessments.forEach((student) => {
    student.assessments.forEach((assessment) => {
      if (!assessment.quarterNumber) return;
      const mt = parseNumericGrade(assessment.grades?.mt);
      if (mt != null) {
        if (!classQuarters[assessment.quarterNumber]) {
          classQuarters[assessment.quarterNumber] = { total: 0, count: 0 };
        }
        classQuarters[assessment.quarterNumber].total += mt;
        classQuarters[assessment.quarterNumber].count += 1;
      }
    });
  });

  const allQuarters = Array.from(
    new Set([...Object.keys(studentQuarters), ...Object.keys(classQuarters)]),
  )
    .map(Number)
    .sort((a, b) => a - b);

  return allQuarters.map((quarterNumber) => ({
    quarterNumber,
    label: `${quarterNumber}º Trimestre`,
    you: studentQuarters[quarterNumber]?.count
      ? Number(
          (
            studentQuarters[quarterNumber].total /
            studentQuarters[quarterNumber].count
          ).toFixed(1),
        )
      : 0,
    classAverage: classQuarters[quarterNumber]?.count
      ? Number(
          (
            classQuarters[quarterNumber].total /
            classQuarters[quarterNumber].count
          ).toFixed(1),
        )
      : 0,
  }));
}

export function useStudentGrades(user) {
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [student, setStudent] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);
  const [ranking, setRanking] = useState({
    position: null,
    total: null,
    average: null,
  });
  const [quarterSeries, setQuarterSeries] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchData() {
      setLoading(true);

      try {
        const studentRes = await getStudentsByUserId(user.uid);
        const rawStudentRecord = studentRes.data?.[0] || null;
        if (!rawStudentRecord) {
          setStudent(null);
          setDataTable([]);
          setQuarters([]);
          setAcademicYear(null);
          setRanking({ position: null, total: 0, average: null });
          return;
        }

        const studentRecord = normalizeStudentRecord(rawStudentRecord);

        const [courseRes, classRes] = await Promise.all([
          getCourseById(studentRecord.cursoId),
          studentRecord.turmaId
            ? getClassById(studentRecord.turmaId)
            : Promise.resolve({ success: false }),
        ]);

        const studentData = {
          ...studentRecord,
          courseName: courseRes.success
            ? courseRes.data.name
            : studentRecord.courseName,
          turmaName:
            classRes.success &&
            (classRes.data.nomeBase || classRes.data.nomeExibicao)
              ? classRes.data.nomeBase || classRes.data.nomeExibicao
              : studentRecord.turmaName,
        };

        setStudent(studentData);

        const [matrixRes, yearRes] = await Promise.all([
          getCourseMatrix(studentRecord.cursoId, studentRecord.classe),
          getActiveAcademicYear(),
        ]);

        setAcademicYear(yearRes.data || null);
        const yearId = yearRes.data?.id;

        const quartersRes = yearId
          ? await getAcademicQuartersByYear(yearId, yearRes.data?.status)
          : { data: [] };
        const academicQuarters = quartersRes.data || [];
        setQuarters(academicQuarters);

        const quarterMap = academicQuarters.reduce((acc, q) => {
          acc[q.id] = q.number;
          return acc;
        }, {});

        const activeQuarter = academicQuarters.find(
          (q) => q.status === "ACTIVE",
        );
        const currentQuarter = activeQuarter?.number ?? null;
        setSelectedQuarter(currentQuarter);

        const assessmentsRes = yearId
          ? await getAssessmentsByStudent(studentRecord.id, yearId)
          : { data: [] };

        const assessments = (assessmentsRes.data || []).map((a) => ({
          ...a,
          quarterNumber: quarterMap[a.quarterId],
        }));

        const table = (matrixRes.data || []).map((item) => ({
          subjectId: item.subjectId,
          subject: item.subject,
          assessments: assessments.filter(
            (a) => a.subjectId === item.subjectId,
          ),
        }));

        setDataTable(table);
        setQuarterSeries(buildQuarterSeries(assessments));

        if (studentRecord.turmaId && yearId) {
          const classStudents = await getStudentsByClass(studentRecord.turmaId);
          const classAssessments = await Promise.all(
            classStudents.map(async (classStudent) => {
              const studentAssessmentsRes = await getAssessmentsByStudent(
                classStudent.id,
                yearId,
              );
              const studentAssessments = (studentAssessmentsRes.data || []).map(
                (a) => ({
                  ...a,
                  quarterNumber: quarterMap[a.quarterId],
                }),
              );

              return {
                studentId: classStudent.id,
                name: classStudent.name,
                assessments: studentAssessments,
              };
            }),
          );

          setRanking(computeStudentRanking(classAssessments, studentRecord.id));

          setQuarterSeries(buildQuarterSeries(assessments, classAssessments));
        } else {
          setRanking({ position: null, total: 0, average: null });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return {
    dataTable,
    loading,
    selectedQuarter,
    setSelectedQuarter,
    student,
    quarters,
    academicYear,
    ranking,
    quarterSeries,
  };
}

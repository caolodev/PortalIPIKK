"use client";

import { useEffect, useState } from "react";

import { getActiveAcademicYear } from "@/services/academicYear";
import { getStudentsByUserId } from "@/services/studentRecordService";
import { getAssessmentsByStudent } from "@/services/assessmentService";
import { getCourseMatrix } from "@/services/subjectService";
import { getAcademicQuartersByYear } from "@/services/academicQuarter";

export function useStudentGrades(user) {
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchData() {
      setLoading(true);

      try {
        const studentRes = await getStudentsByUserId(user.uid);
        const student = studentRes.data[0];

        const matrixRes = await getCourseMatrix(
          student.cursoId,
          student.classe,
        );

        const yearRes = await getActiveAcademicYear();
        const yearId = yearRes.data.id;

        const quartersRes = await getAcademicQuartersByYear(yearId);
        const quarters = quartersRes.data;

        const quarterMap = {};
        let activeQuarter = null;
        const today = new Date();

        quarters.forEach((q) => {
          quarterMap[q.id] = q.number;

          if (today >= new Date(q.startDate) && today <= new Date(q.endDate)) {
            activeQuarter = q.number;
          }
        });

        setSelectedQuarter(activeQuarter);

        const assessmentsRes = await getAssessmentsByStudent(
          student.id,
          yearId,
        );

        const assessments = (assessmentsRes.data || []).map((a) => ({
          ...a,
          quarterNumber: quarterMap[a.quarterId],
        }));

        const table = matrixRes.data.map((item) => ({
          subjectId: item.subjectId,
          subject: item.subject,
          assessments: assessments.filter(
            (a) => a.subjectId === item.subjectId,
          ),
        }));

        setDataTable(table);
      } catch (e) {
        console.error(e);
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
  };
}
